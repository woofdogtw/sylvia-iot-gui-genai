<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('router.lan.title') }}</div>
      <q-space />
      <q-btn flat round icon="refresh" :title="t('router.common.refresh')" @click="fetchAll" />
    </div>

    <!-- LAN Config Card -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">{{ t('router.lan.config') }}</div>
        <q-form ref="formRef" greedy>
          <q-input
            v-model="form.address"
            :label="t('router.lan.address')"
            dense
            outlined
            class="q-mb-sm"
          />
          <q-toggle v-model="form.dhcpEnabled" :label="t('router.lan.dhcpEnabled')" class="q-mb-sm" />
          <template v-if="form.dhcpEnabled">
            <q-input
              v-model="form.dhcpStart"
              :label="t('router.lan.dhcpStart')"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-input
              v-model="form.dhcpEnd"
              :label="t('router.lan.dhcpEnd')"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-input
              v-model.number="form.leaseTime"
              :label="t('router.lan.leaseTime')"
              type="number"
              dense
              outlined
              class="q-mb-sm"
            />
          </template>
        </q-form>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" :label="t('router.common.save')" @click="submitLan" />
      </q-card-actions>
    </q-card>

    <!-- DHCP Leases Table -->
    <q-card>
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">{{ t('router.lan.leases') }}</div>
        <q-table
          :rows="leases"
          :columns="leaseColumns"
          row-key="ip"
          dense
          flat
          :no-data-label="t('router.common.loading')"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { lanApi } from '../api/index.js'
import { notifyApiError, notifySuccess } from '../utils/notify.js'

const { t } = useI18n()

const formRef = ref(null)
const form = ref({
  address: '',
  dhcpEnabled: false,
  dhcpStart: '',
  dhcpEnd: '',
  leaseTime: 86400,
})
const leases = ref([])

const leaseColumns = computed(() => [
  { name: 'ip', label: t('router.lan.leaseIp'), field: 'ip', align: 'left' },
  { name: 'mac', label: t('router.lan.leaseMac'), field: 'mac', align: 'left' },
  { name: 'hostname', label: t('router.lan.leaseHostname'), field: 'hostname', align: 'left' },
  { name: 'start', label: t('router.lan.leaseStart'), field: 'startStr', align: 'left' },
  { name: 'end', label: t('router.lan.leaseEnd'), field: 'endStr', align: 'left' },
])

function formatTime(ms) {
  if (!ms) return '-'
  return new Date(ms).toLocaleString()
}

async function fetchConfig() {
  try {
    const res = await lanApi.get()
    const data = res.data?.data
    if (!data) return
    const conf = data.conf4 || {}
    form.value = {
      address: conf.address || '',
      dhcpEnabled: !!conf.dhcpStart,
      dhcpStart: conf.dhcpStart || '',
      dhcpEnd: conf.dhcpEnd || '',
      leaseTime: conf.leaseTime || 86400,
    }
  } catch (err) {
    notifyApiError(err, t)
  }
}

async function fetchLeases() {
  try {
    const res = await lanApi.getLeases()
    const data = res.data?.data || []
    leases.value = data.map((l) => ({
      ...l,
      startStr: formatTime(l.starts),
      endStr: formatTime(l.ends),
    }))
  } catch (err) {
    notifyApiError(err, t)
  }
}

function fetchAll() {
  fetchConfig()
  fetchLeases()
}

async function submitLan() {
  try {
    const conf4 = { address: form.value.address }
    if (form.value.dhcpEnabled) {
      conf4.dhcpStart = form.value.dhcpStart
      conf4.dhcpEnd = form.value.dhcpEnd
      conf4.leaseTime = form.value.leaseTime
    }
    await lanApi.update({ conf4 })
    notifySuccess(t('router.common.saveSuccess'))
    fetchConfig()
  } catch (err) {
    notifyApiError(err, t)
  }
}

onMounted(fetchAll)
</script>
