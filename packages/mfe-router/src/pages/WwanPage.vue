<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('router.wwan.title') }}</div>
      <q-space />
      <q-btn v-if="supported" flat round icon="refresh" :title="t('router.common.refresh')" @click="fetchConfig" />
    </div>

    <q-banner v-if="!supported && !loading" class="bg-warning text-white">
      {{ t('router.common.notSupported') }}
    </q-banner>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner size="40px" />
    </div>

    <template v-if="supported && !loading">
      <!-- Connection Status Card -->
      <q-card class="q-mb-md">
        <q-card-section>
          <q-toggle v-model="form.enable" :label="form.enable ? t('router.common.enabled') : t('router.common.disabled')" class="q-mb-sm" />
          <div v-if="connectedSsid" class="q-mt-sm">
            <q-badge color="positive">{{ t('router.wwan.connectedTo') }}: {{ connectedSsid }}</q-badge>
          </div>
          <div v-if="connIp" class="text-caption q-mt-xs">{{ t('router.wan.address') }}: {{ connIp }}</div>
        </q-card-section>
      </q-card>

      <!-- Connect Form -->
      <q-card v-if="form.enable" class="q-mb-md">
        <q-card-section>
          <q-input v-model="form.ssid" :label="t('router.wwan.ssid')" dense outlined class="q-mb-sm" />
          <q-input v-model="form.password" :label="t('router.wwan.password')" type="password" dense outlined class="q-mb-sm" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="primary" :label="t('router.common.save')" @click="submitConfig" />
        </q-card-actions>
      </q-card>

      <!-- Scan Section -->
      <q-card v-if="form.enable">
        <q-card-section>
          <div class="row items-center q-mb-sm">
            <q-btn
              :label="scanning ? t('router.wwan.scanning') : t('router.wwan.scan')"
              :loading="scanning"
              flat
              color="primary"
              @click="scanAps"
            />
          </div>
          <q-table
            v-if="apList.length"
            :rows="apList"
            :columns="apColumns"
            row-key="ssid"
            dense
            flat
            selection="single"
            v-model:selected="selectedAp"
            @row-click="onApClick"
          />
          <div v-else-if="scanned" class="text-caption">{{ t('router.wwan.noAps') }}</div>
        </q-card-section>
      </q-card>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { wwanApi } from '../api/index.js'
import { notifyApiError, notifySuccess } from '../utils/notify.js'

const { t } = useI18n()

const loading = ref(true)
const supported = ref(true)
const scanning = ref(false)
const scanned = ref(false)
const apList = ref([])
const selectedAp = ref([])
const connectedSsid = ref('')
const connIp = ref('')
const form = ref({ enable: false, ssid: '', password: '' })

const apColumns = computed(() => [
  { name: 'ssid', label: t('router.wwan.ssid'), field: 'ssid', align: 'left' },
  { name: 'security', label: t('router.wwan.security'), field: 'security', align: 'left' },
  { name: 'channel', label: t('router.wwan.channel'), field: 'channel', align: 'center' },
  { name: 'signal', label: t('router.wwan.signal'), field: 'signal', align: 'center' },
])

watch(selectedAp, (val) => {
  if (val.length) {
    form.value.ssid = val[0].ssid
    form.value.password = ''
  }
})

function onApClick(evt, row) {
  selectedAp.value = [row]
}

async function fetchConfig() {
  loading.value = true
  try {
    const res = await wwanApi.get()
    const data = res.data?.data
    if (!data) {
      supported.value = false
      return
    }
    form.value.enable = !!data.enable
    form.value.ssid = data.conf?.ssid || ''
    form.value.password = ''
    connectedSsid.value = data.conf?.ssid || ''
    connIp.value = data.conn4?.address || ''
    supported.value = true
  } catch (err) {
    if (err.response?.status === 404) {
      supported.value = false
    } else {
      notifyApiError(err, t)
    }
  } finally {
    loading.value = false
  }
}

async function scanAps() {
  scanning.value = true
  scanned.value = false
  try {
    const res = await wwanApi.scan()
    apList.value = res.data?.data || []
    scanned.value = true
  } catch (err) {
    notifyApiError(err, t)
  } finally {
    scanning.value = false
  }
}

async function submitConfig() {
  try {
    const body = { enable: form.value.enable }
    if (form.value.enable) {
      body.conf = { ssid: form.value.ssid }
      if (form.value.password) {
        body.conf.password = form.value.password
      }
    }
    await wwanApi.update(body)
    notifySuccess(t('router.common.saveSuccess'))
    fetchConfig()
  } catch (err) {
    notifyApiError(err, t)
  }
}

onMounted(fetchConfig)
</script>
