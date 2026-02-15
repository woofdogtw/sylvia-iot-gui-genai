<template>
  <q-page padding>
    <!-- Toolbar -->
    <div class="row q-mb-md q-gutter-sm items-center">
      <q-select
        v-model="selectedUnit" :options="unitOptions" :label="t('core.common.selectUnit')"
        dense outlined emit-value map-options class="col-auto" style="min-width: 180px"
        @update:model-value="onUnitChange"
      />
      <q-space />
      <q-btn flat round icon="refresh" :title="t('core.common.refresh')" @click="refresh" />
      <q-btn flat round icon="download" :title="t('core.common.exportCsv')" @click="onExportCsv" />
    </div>

    <!-- Data Table -->
    <q-table
      :rows="rows" :columns="columns" :loading="loading"
      v-model:pagination="pagination" row-key="dataId"
      :visible-columns="visibleColumns" :no-data-label="t('core.common.noData')"
      @request="onRequest"
    >
      <template #body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn flat round dense icon="delete" size="sm" color="negative" @click="openDeleteDialog(props.row)" />
          <q-btn flat round dense icon="info" size="sm" @click="openDetailDialog(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Detail Dialog -->
    <q-dialog v-model="showDetail" @keyup.escape="showDetail = false">
      <q-card style="min-width: 450px">
        <q-card-section><div class="text-h6">{{ t('core.common.detail') }}</div></q-card-section>
        <q-card-section>
          <q-list dense>
            <q-item><q-item-section><q-item-label caption>{{ t('core.dlDataBuffer.applicationCode') }}</q-item-label><q-item-label>{{ detailItem.applicationCode }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.dlDataBuffer.device') }}</q-item-label><q-item-label>{{ detailItem.deviceNetworkAddr }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.common.payload') }}</q-item-label><q-item-label style="word-break: break-all">{{ detailItem.payload || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.common.created') }}</q-item-label><q-item-label>{{ formatTime(detailItem.createdAt) }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.dlDataBuffer.expired') }}</q-item-label><q-item-label>{{ formatTime(detailItem.expiredAt) }}</q-item-label></q-item-section></q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right"><q-btn flat :label="t('core.common.close')" @click="showDetail = false" /></q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Dialog -->
    <q-dialog v-model="showDelete" @keyup.enter="submitDelete" @keyup.escape="showDelete = false">
      <q-card>
        <q-card-section><div class="text-h6">{{ t('core.common.confirm') }}</div></q-card-section>
        <q-card-section>{{ t('core.common.deleteConfirm', { name: deleteItem.dataId }) }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('core.common.cancel')" @click="showDelete = false" />
          <q-btn flat color="negative" :label="t('core.common.delete')" @click="submitDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useListPage } from '../composables/useListPage.js'
import { useRoles } from '../composables/useRoles.js'
import { dlDataBufferApi, unitApi } from '../api/index.js'
import { exportCsv } from '../utils/csv.js'
import { notifyApiError, notifySuccess } from '../utils/notify.js'
import { formatTime } from '../utils/format.js'

const { t } = useI18n()
const $q = useQuasar()
const { isAdminOrManager } = useRoles()

const selectedUnit = ref(null)
const unitOptions = ref([])

async function loadUnits() {
  try {
    const res = await unitApi.list({ limit: 0 })
    const units = res.data?.data || []
    const opts = units.map((u) => ({ label: u.code, value: u.unitId }))
    if (isAdminOrManager.value) {
      unitOptions.value = [{ label: t('core.common.allUnits'), value: null }, ...opts]
    } else {
      unitOptions.value = [...opts]
      if (opts.length) {
        selectedUnit.value = opts[0].value
        filterParams.unit = selectedUnit.value
      }
    }
  } catch { /* ignore */ }
}

function onUnitChange() { filterParams.unit = selectedUnit.value || undefined; refresh() }

const columns = computed(() => [
  { name: 'applicationCode', label: t('core.dlDataBuffer.applicationCode'), field: 'applicationCode', align: 'left', sortable: true },
  { name: 'device', label: t('core.dlDataBuffer.device'), field: 'deviceNetworkAddr', align: 'left' },
  { name: 'createdAt', label: t('core.common.created'), field: 'createdAtStr', align: 'left', sortable: true },
  { name: 'expiredAt', label: t('core.dlDataBuffer.expired'), field: 'expiredAtStr', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
])

const visibleColumns = computed(() => {
  const cols = ['applicationCode', 'device', 'actions']
  if ($q.screen.gt.sm) cols.push('createdAt', 'expiredAt')
  return cols
})

const {
  rows, loading, pagination, filterParams, fetchData, onRequest, refresh,
} = useListPage({
  apiList: dlDataBufferApi.list,
  apiCount: dlDataBufferApi.count,
  mapRow: (row) => ({
    ...row,
    deviceNetworkAddr: row.deviceNetworkAddr || row.deviceId || '-',
    createdAtStr: formatTime(row.createdAt),
    expiredAtStr: formatTime(row.expiredAt),
  }),
})

// ── Detail / Delete ──
const showDetail = ref(false)
const detailItem = ref({})
function openDetailDialog(row) { detailItem.value = row; showDetail.value = true }

const showDelete = ref(false)
const deleteItem = ref({})
function openDeleteDialog(row) { deleteItem.value = row; showDelete.value = true }
async function submitDelete() {
  try { await dlDataBufferApi.delete(deleteItem.value.dataId); notifySuccess(t('core.common.deleteSuccess')); showDelete.value = false; refresh() }
  catch (err) { notifyApiError(err, t) }
}

async function onExportCsv() {
  try { await exportCsv('/api/v1/dldata-buffer/list', 'dldata-buffers.csv', filterParams) }
  catch (err) { notifyApiError(err, t) }
}

onMounted(async () => { await loadUnits(); fetchData() })
</script>
