<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('router.wan.title') }}</div>
      <q-space />
      <q-btn flat round icon="refresh" :title="t('router.common.refresh')" @click="fetchWanList" />
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner size="40px" />
    </div>

    <div v-else class="row q-gutter-md">
      <q-card v-for="wan in wanList" :key="wan.wanId" class="col-12 col-md-5">
        <q-card-section>
          <div class="row items-center">
            <div class="text-subtitle1">{{ wan.wanId }}</div>
            <q-space />
            <q-badge :color="wan.conn4?.address ? 'positive' : 'grey'" :label="wan.conn4?.address ? t('router.wan.connected') : t('router.wan.disconnected')" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-list dense>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('router.wan.type') }}</q-item-label>
                <q-item-label>{{ typeLabel(wan.conf?.type) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="wan.conn4?.address">
              <q-item-section>
                <q-item-label caption>{{ t('router.wan.address') }}</q-item-label>
                <q-item-label>{{ wan.conn4.address }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="wan.conn4?.gateway">
              <q-item-section>
                <q-item-label caption>{{ t('router.wan.gateway') }}</q-item-label>
                <q-item-label>{{ wan.conn4.gateway }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="wan.conn4?.dns?.length">
              <q-item-section>
                <q-item-label caption>{{ t('router.wan.dns') }}</q-item-label>
                <q-item-label>{{ wan.conn4.dns.join(', ') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat icon="edit" :label="t('router.common.edit')" @click="openEdit(wan)" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEdit" @keyup.escape="showEdit = false">
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">{{ editWanId }}</div>
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="editForm.type"
            :label="t('router.wan.type')"
            :options="typeOptions"
            emit-value
            map-options
            dense
            outlined
            class="q-mb-sm"
          />

          <template v-if="editForm.type === 'ethernet'">
            <q-select
              v-model="editForm.type4"
              :label="t('router.wan.type')"
              :options="subTypeOptions"
              emit-value
              map-options
              dense
              outlined
              class="q-mb-sm"
            />
            <template v-if="editForm.type4 === 'static'">
              <q-input v-model="editForm.address" :label="t('router.wan.address')" dense outlined class="q-mb-sm" />
              <q-input v-model="editForm.gateway" :label="t('router.wan.gateway')" dense outlined class="q-mb-sm" />
              <q-input v-model="editForm.dns" :label="t('router.wan.dns')" hint="comma-separated" dense outlined class="q-mb-sm" />
            </template>
          </template>

          <template v-if="editForm.type === 'pppoe'">
            <q-input v-model="editForm.username" :label="t('router.wan.username')" dense outlined class="q-mb-sm" />
            <q-input v-model="editForm.password" :label="t('router.wan.password')" type="password" dense outlined class="q-mb-sm" />
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('router.common.cancel')" @click="showEdit = false" />
          <q-btn flat color="primary" :label="t('router.common.save')" @click="submitEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { wanApi } from '../api/index.js'
import { notifyApiError, notifySuccess } from '../utils/notify.js'

const { t } = useI18n()

const loading = ref(false)
const wanList = ref([])
const showEdit = ref(false)
const editWanId = ref('')
const editForm = ref({ type: 'disable', type4: 'dhcp', address: '', gateway: '', dns: '', username: '', password: '' })

const typeOptions = computed(() => [
  { label: t('router.wan.typeDisable'), value: 'disable' },
  { label: t('router.wan.typeEthernet'), value: 'ethernet' },
  { label: t('router.wan.typePppoe'), value: 'pppoe' },
])

const subTypeOptions = computed(() => [
  { label: t('router.wan.subTypeDhcp'), value: 'dhcp' },
  { label: t('router.wan.subTypeStatic'), value: 'static' },
])

function typeLabel(type) {
  if (type === 'ethernet') return t('router.wan.typeEthernet')
  if (type === 'pppoe') return t('router.wan.typePppoe')
  return t('router.wan.typeDisable')
}

async function fetchWanList() {
  loading.value = true
  try {
    const res = await wanApi.list()
    wanList.value = res.data?.data || []
  } catch (err) {
    notifyApiError(err, t)
  } finally {
    loading.value = false
  }
}

function openEdit(wan) {
  editWanId.value = wan.wanId
  const conf = wan.conf || {}
  editForm.value = {
    type: conf.type || 'disable',
    type4: conf.type4 || 'dhcp',
    address: conf.static4?.address || '',
    gateway: conf.static4?.gateway || '',
    dns: (conf.static4?.dns || []).join(', '),
    username: conf.pppoe?.username || '',
    password: conf.pppoe?.password || '',
  }
  showEdit.value = true
}

async function submitEdit() {
  try {
    const body = { type: editForm.value.type }
    if (editForm.value.type === 'ethernet') {
      body.type4 = editForm.value.type4
      if (editForm.value.type4 === 'static') {
        body.static4 = {
          address: editForm.value.address,
          gateway: editForm.value.gateway,
          dns: editForm.value.dns.split(',').map((s) => s.trim()).filter(Boolean),
        }
      }
    } else if (editForm.value.type === 'pppoe') {
      body.pppoe = {
        username: editForm.value.username,
        password: editForm.value.password,
      }
    }
    await wanApi.update(editWanId.value, body)
    notifySuccess(t('router.common.saveSuccess'))
    showEdit.value = false
    fetchWanList()
  } catch (err) {
    notifyApiError(err, t)
  }
}

onMounted(fetchWanList)
</script>
