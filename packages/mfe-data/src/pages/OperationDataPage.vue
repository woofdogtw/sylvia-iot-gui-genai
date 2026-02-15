<template>
  <q-page padding>
    <!-- Toolbar -->
    <div class="row q-mb-md q-gutter-sm items-center">
      <q-input
        v-if="isAdminOrManager"
        v-model="filterUser" :label="t('data.common.filterUser')"
        dense outlined class="col-auto" style="min-width: 180px"
        debounce="500"
        @update:model-value="onUserChange"
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
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="props.row.status >= 200 && props.row.status < 300 ? 'positive' : 'negative'">
            {{ props.row.status }}
          </q-badge>
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
      <q-card style="min-width: 550px">
        <q-card-section><div class="text-h6">{{ t('data.common.detail') }}</div></q-card-section>
        <q-card-section>
          <q-list dense>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.dataId') }}</q-item-label><q-item-label>{{ detailItem.dataId }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.reqTime') }}</q-item-label><q-item-label>{{ formatTime(detailItem.reqTime) }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.respTime') }}</q-item-label><q-item-label>{{ formatTime(detailItem.resTime) }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.operation.latency') }}</q-item-label><q-item-label>{{ detailItem.latencyMs }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.common.status') }}</q-item-label><q-item-label><q-badge :color="detailItem.status >= 200 && detailItem.status < 300 ? 'positive' : 'negative'">{{ detailItem.status }}</q-badge></q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.operation.sourceIp') }}</q-item-label><q-item-label>{{ detailItem.sourceIp || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.operation.method') }}</q-item-label><q-item-label>{{ detailItem.method || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.operation.path') }}</q-item-label><q-item-label style="word-break: break-all">{{ detailItem.path || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.operation.body') }}</q-item-label><q-item-label style="word-break: break-all; white-space: pre-wrap">{{ detailItem.bodyStr || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.operation.userId') }}</q-item-label><q-item-label>{{ detailItem.userId || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.operation.clientId') }}</q-item-label><q-item-label>{{ detailItem.clientId || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.operation.errCode') }}</q-item-label><q-item-label>{{ detailItem.errCode || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('data.operation.errMessage') }}</q-item-label><q-item-label style="word-break: break-all">{{ detailItem.errMessage || '-' }}</q-item-label></q-item-section></q-item>
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
import { useListPage } from '../composables/useListPage.js'
import { useRoles } from '../composables/useRoles.js'
import { coremgrOpDataApi } from '../api/index.js'
import { exportCsv } from '../utils/csv.js'
import { notifyApiError } from '../utils/notify.js'
import { formatTime } from '../utils/format.js'

const { t } = useI18n()
const { isAdminOrManager } = useRoles()

const filterUser = ref('')
const timeStart = ref('')
const timeEnd = ref('')

function onUserChange() {
  filterParams.cuser = filterUser.value || undefined
  refresh()
}

function onTimeChange() {
  filterParams.tfield = 'req'
  filterParams.tstart = timeStart.value ? new Date(timeStart.value).toISOString() : undefined
  filterParams.tend = timeEnd.value ? new Date(timeEnd.value).toISOString() : undefined
  refresh()
}

const columns = computed(() => [
  { name: 'req', label: t('data.common.reqTime'), field: 'reqTimeStr', align: 'left', sortable: true },
  { name: 'latency', label: t('data.operation.latency'), field: 'latencyMs', align: 'left' },
  { name: 'status', label: t('data.common.status'), field: 'status', align: 'left' },
  { name: 'method', label: t('data.operation.method'), field: 'method', align: 'left' },
  { name: 'path', label: t('data.operation.path'), field: 'path', align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
])

const {
  rows, loading, pagination, filterParams, fetchData, onRequest, refresh,
} = useListPage({
  apiList: coremgrOpDataApi.list,
  apiCount: coremgrOpDataApi.count,
  mapRow: (row) => ({
    ...row,
    reqTimeStr: formatTime(row.reqTime),
    latencyMs: row.latencyMs ?? (row.reqTime && row.resTime
      ? Math.round(new Date(row.resTime).getTime() - new Date(row.reqTime).getTime())
      : '-'),
    bodyStr: row.body ? JSON.stringify(row.body, null, 2) : '',
  }),
})

pagination.value.sortBy = 'req'
pagination.value.descending = true

const showDetail = ref(false)
const detailItem = ref({})
function openDetailDialog(row) { detailItem.value = row; showDetail.value = true }

async function onExportCsv() {
  try {
    const params = {}
    if (filterParams.cuser) params.cuser = filterParams.cuser
    if (filterParams.tfield) params.tfield = filterParams.tfield
    if (filterParams.tstart) params.tstart = filterParams.tstart
    if (filterParams.tend) params.tend = filterParams.tend
    await exportCsv('/data/api/v1/coremgr-opdata/list', 'coremgr-opdata.csv', params)
  } catch (err) { notifyApiError(err, t) }
}

onMounted(() => { fetchData() })
</script>
