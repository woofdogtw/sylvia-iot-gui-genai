<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('router.wwan.title') }}</div>
      <q-space />
    </div>

    <q-banner v-if="!supported && !loading" class="bg-warning text-white">
      {{ t('router.common.notSupported') }}
    </q-banner>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner size="40px" />
    </div>

    <template v-if="supported && !loading">
      <!-- Connection Status -->
      <q-card class="q-mb-md">
        <q-card-section>
          <q-list dense>
            <q-item v-if="status.ssid">
              <q-item-section>
                <q-item-label caption>{{ t('router.wwan.ssid') }}</q-item-label>
                <q-item-label>{{ status.ssid }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="status.hostIp">
              <q-item-section>
                <q-item-label caption>{{ t('router.wwan.hostIp') }}</q-item-label>
                <q-item-label>{{ status.hostIp }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="status.gateway">
              <q-item-section>
                <q-item-label caption>{{ t('router.wwan.gateway') }}</q-item-label>
                <q-item-label>{{ status.gateway }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="status.dns">
              <q-item-section>
                <q-item-label caption>{{ t('router.wwan.dns') }}</q-item-label>
                <q-item-label>{{ status.dns }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="!status.ssid && !status.hostIp">
              <q-item-section>
                <q-item-label class="text-grey">{{ t('router.wan.disconnected') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions v-if="status.ssid" align="right">
          <q-btn flat color="negative" :label="t('router.wwan.disconnect')" @click="disconnectWwan" />
        </q-card-actions>
      </q-card>

      <!-- AP List -->
      <q-card>
        <q-card-section>
          <q-table
            v-if="apList.length"
            :rows="apList"
            :columns="apColumns"
            row-key="index"
            dense
            flat
          >
            <template #body-cell-connect="props">
              <q-td :props="props">
                <q-btn
                  v-if="props.row.ssid !== status.ssid"
                  flat
                  dense
                  color="primary"
                  :label="t('router.wwan.connect')"
                  @click="onConnectClick(props.row)"
                />
              </q-td>
            </template>
          </q-table>
          <div v-else class="text-caption text-grey">{{ t('router.wwan.noAps') }}</div>
        </q-card-section>
      </q-card>
    </template>

    <!-- Password Dialog -->
    <q-dialog v-model="showPasswordDialog" @show="onPasswordDialogShow">
      <q-card style="min-width: 320px">
        <q-card-section>
          <div class="text-subtitle1">{{ connectTarget?.ssid }}</div>
        </q-card-section>
        <q-card-section>
          <q-form ref="pwFormRef" greedy>
            <q-input
              v-model="connectPassword"
              :label="t('router.wwan.enterPassword')"
              type="password"
              :rules="[v => isNonEmpty(v, t)]"
              dense
              outlined
              autofocus
              @keyup.enter="isPwFormValid && onPasswordConfirm()"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('router.common.cancel')" @click="showPasswordDialog = false" />
          <q-btn flat color="primary" :label="t('router.common.save')" :disable="!isPwFormValid" @click="onPasswordConfirm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, shallowRef, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { wwanApi } from '../api/index.js'
import { showApiError, notifySuccess } from '../utils/notify.js'
import { isNonEmpty } from '../utils/validate.js'

const { t } = useI18n()

const loading = ref(true)
const supported = ref(true)
const apList = shallowRef([])
const status = ref({ ssid: '', hostIp: '', gateway: '', dns: '' })

const connectTarget = ref(null)
const showPasswordDialog = ref(false)
const connectPassword = ref('')
const pwFormRef = ref(null)
const isPwFormValid = ref(false)

async function onPasswordDialogShow() {
  await nextTick()
  isPwFormValid.value = await pwFormRef.value?.validate(false) ?? false
}

watch(connectPassword, async () => {
  if (!pwFormRef.value) return
  await nextTick()
  isPwFormValid.value = await pwFormRef.value.validate(false) ?? false
})

const apColumns = computed(() => [
  { name: 'ssid', label: t('router.wwan.ssid'), field: 'ssid', align: 'left' },
  { name: 'security', label: t('router.wwan.security'), field: 'security', align: 'left' },
  { name: 'channel', label: t('router.wwan.channel'), field: 'channel', align: 'center' },
  { name: 'signal', label: t('router.wwan.signal'), field: 'signal', align: 'center' },
  { name: 'connect', label: '', field: 'connect', align: 'center' },
])

let statusTimer = null
let scanTimer = null

async function pollStatus() {
  try {
    const res = await wwanApi.get()
    const data = res.data?.data
    if (!data) {
      supported.value = false
      return
    }
    status.value = {
      ssid: data.conf?.ssid || '',
      hostIp: data.conn4?.address || '',
      gateway: data.conn4?.gateway || '',
      dns: Array.isArray(data.conn4?.dns) ? data.conn4.dns.join(', ') : (data.conn4?.dns || ''),
    }
    supported.value = true
  } catch (err) {
    if (err.response?.status === 404) {
      supported.value = false
    } else {
      showApiError(err, t)
    }
  }
}

async function pollApList() {
  try {
    const res = await wwanApi.scan()
    const items = res.data?.data || []
    const connectedSsid = status.value.ssid
    if (connectedSsid) {
      items.sort((a, b) => (a.ssid === connectedSsid ? -1 : b.ssid === connectedSsid ? 1 : 0))
    }
    apList.value = items
  } catch {
    // scan errors are silent — status polling handles critical errors
  }
}

function scheduleNextStatus() {
  if (statusTimer !== null) return   // already scheduled or stopped
  statusTimer = setTimeout(async () => {
    statusTimer = null               // free slot before awaiting
    await pollStatus()
    if (supported.value) scheduleNextStatus()
  }, 5000)
}

function scheduleNextScan() {
  if (scanTimer !== null) return
  scanTimer = setTimeout(async () => {
    scanTimer = null
    await pollApList()
    if (supported.value) scheduleNextScan()
  }, 5000)
}

async function disconnectWwan() {
  try {
    await wwanApi.update({ enable: false, conf: { ssid: status.value.ssid } })
    await pollStatus()
  } catch (err) {
    showApiError(err, t)
  }
}

function onConnectClick(ap) {
  if (ap.security === 'none' || ap.security === 'open') {
    doConnect(ap.ssid, '')
  } else {
    connectTarget.value = ap
    connectPassword.value = ''
    showPasswordDialog.value = true
  }
}

async function onPasswordConfirm() {
  const valid = await pwFormRef.value.validate()
  if (!valid) return
  await doConnect(connectTarget.value.ssid, connectPassword.value)
  showPasswordDialog.value = false
}

async function doConnect(ssid, password) {
  try {
    const body = { enable: true, conf: { ssid } }
    if (password) {
      body.conf.password = password
    }
    await wwanApi.update(body)
    notifySuccess(t('router.common.saveSuccess'))
    await pollStatus()
  } catch (err) {
    showApiError(err, t)
  }
}

onMounted(async () => {
  await pollStatus()
  loading.value = false
  if (supported.value) {
    pollApList()
    scheduleNextStatus()
    scheduleNextScan()
  }
})

onUnmounted(() => {
  clearTimeout(statusTimer)
  statusTimer = false   // non-null sentinel: prevents rescheduling from in-flight callbacks
  clearTimeout(scanTimer)
  scanTimer = false
})
</script>
