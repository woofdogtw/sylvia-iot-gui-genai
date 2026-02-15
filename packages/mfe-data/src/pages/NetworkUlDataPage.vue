<template>
  <q-page padding>
    <!-- Toolbar -->
    <div class="row q-mb-md q-gutter-sm items-center">
      <q-select
        v-model="selectedUnit" :options="unitOptions" :label="t('data.common.selectUnit')"
        dense outlined emit-value map-options class="col-auto" style="min-width: 180px"
        @update:model-value="onUnitChange"
      />
      <q-input
        v-model="timeStart" :label="t('data.common.timeStart')" dense outlined
        class="col-auto" style="min-width: 200px" type="datetime-local"
        @update:model-value="onTimeChange"
      />
      <q-input
        v-model="timeEnd" :label="t('data.common.timeEnd')" dense outlined
        class="col-auto" style="min-width: 200px" type="datetime-local"
        @update:model-value="onTimeChange"
      />
      <q-space />
      <q-btn-toggle
        v-model="payloadMode" no-caps dense unelevated
        :options="[{ label: t('data.common.hex'), value: 'hex' }, { label: t('data.common.text'), value: 'text' }]"
        toggle-color="primary"
      />
      <q-btn flat round icon="refresh" :title="t('data.common.refresh')" @click="refresh" />
      <q-btn flat round icon="download" :title="t('data.common.exportCsv')" @click="onExportCsv" />
    </div>

    <!-- Data Table -->
    <q-table
      :rows="rows" :columns="columns" :loading="loading"
      v-model:pagination="pagination" row-key="dataId"
      :no-data-label="t('data.common.noData')"
      @request="onRequest"
    >
      <template #body-cell-data="props">
        <q-td :props="props" style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
          {{ payloadMode === 'hex' ? props.row.dataHex : props.row.dataText }}
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn flat round dense icon="info" size="sm" @click="openDetailDialog(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Detail Dialog -->
    <q-dialog v-model="showDetail" @keyup.escape="showDetail = false">
      <q-card style="min-width: 500px">
        <q-card-section><div class="text-h6">{{ t('data.common.detail') }}</div></q-card-section>
        <q-card-section>
          <q-list dense>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.dataId') }}</q-item-label><q-item-label>{{ detailItem.dataId }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.procTime') }}</q-item-label><q-item-label>{{ formatTime(detailItem.proc) }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.unitCode') }}</q-item-label><q-item-label>{{ detailItem.unitCode || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.networkCode') }}</q-item-label><q-item-label>{{ detailItem.networkCode || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.networkAddr') }}</q-item-label><q-item-label>{{ detailItem.networkAddr || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.unitId') }}</q-item-label><q-item-label>{{ detailItem.unitId || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.deviceId') }}</q-item-label><q-item-label>{{ detailItem.deviceId || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.deviceTime') }}</q-item-label><q-item-label>{{ formatTime(detailItem.time) }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.profile') }}</q-item-label><q-item-label>{{ detailItem.profile || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.data') }}</q-item-label><q-item-label style="word-break: break-all">{{ detailItem.dataHex || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.extension') }}</q-item-label><q-item-label style="word-break: break-all; white-space: pre-wrap">{{ detailItem.extensionStr || '-' }}</q-item-label></q-item-section></q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right"><q-btn flat :label="t('data.common.close')" @click="showDetail = false" /></q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, coremgrUrl } from '@sylvia-iot/shared'
import { useListPage } from '../composables/useListPage.js'
import { useRoles } from '../composables/useRoles.js'
import { networkUlDataApi } from '../api/index.js'
import { exportCsv } from '../utils/csv.js'
import { notifyApiError } from '../utils/notify.js'
import { formatTime, hexToText } from '../utils/format.js'

const { t } = useI18n()
const { isAdminOrManager } = useRoles()

const selectedUnit = ref(null)
const unitOptions = ref([])
const timeStart = ref('')
const timeEnd = ref('')
const payloadMode = ref('hex')

async function loadUnits() {
  try {
    const res = await api.get(coremgrUrl('/api/v1/unit/list'), { params: { limit: 0 } })
    const units = res.data?.data || []
    const opts = units.map((u) => ({ label: u.code, value: u.unitId }))
    if (isAdminOrManager.value) {
      unitOptions.value = [{ label: t('data.common.allUnits'), value: null }, ...opts]
    } else {
      unitOptions.value = [...opts]
      if (opts.length) {
        selectedUnit.value = opts[0].value
        filterParams.unit = selectedUnit.value
      }
    }
  } catch { /* ignore */ }
}

function onUnitChange() {
  filterParams.unit = selectedUnit.value || undefined
  refresh()
}

function onTimeChange() {
  filterParams.tfield = 'proc'
  filterParams.tstart = timeStart.value ? new Date(timeStart.value).toISOString() : undefined
  filterParams.tend = timeEnd.value ? new Date(timeEnd.value).toISOString() : undefined
  refresh()
}

const columns = computed(() => [
  { name: 'proc', label: t('data.common.procTime'), field: 'procStr', align: 'left', sortable: true },
  { name: 'time', label: t('data.common.deviceTime'), field: 'timeStr', align: 'left', sortable: true },
  { name: 'device', label: t('data.common.device'), field: 'deviceDisplay', align: 'left' },
  { name: 'data', label: t('data.common.data'), field: 'dataHex', align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
])

const {
  rows, loading, pagination, filterParams, fetchData, onRequest, refresh,
} = useListPage({
  apiList: networkUlDataApi.list,
  apiCount: networkUlDataApi.count,
  mapRow: (row) => ({
    ...row,
    procStr: formatTime(row.proc),
    timeStr: formatTime(row.time),
    deviceDisplay: row.networkCode && row.networkAddr ? `${row.networkCode}/${row.networkAddr}` : '-',
    dataHex: row.data || '',
    dataText: hexToText(row.data),
    extensionStr: row.extension ? JSON.stringify(row.extension, null, 2) : '',
  }),
})

pagination.value.sortBy = 'proc'
pagination.value.descending = true

const showDetail = ref(false)
const detailItem = ref({})
function openDetailDialog(row) { detailItem.value = row; showDetail.value = true }

async function onExportCsv() {
  try {
    const params = {}
    if (filterParams.unit) params.unit = filterParams.unit
    if (filterParams.tfield) params.tfield = filterParams.tfield
    if (filterParams.tstart) params.tstart = filterParams.tstart
    if (filterParams.tend) params.tend = filterParams.tend
    await exportCsv('/data/api/v1/network-uldata/list', 'network-uldata.csv', params)
  } catch (err) { notifyApiError(err, t) }
}

onMounted(async () => { await loadUnits(); fetchData() })
</script>
