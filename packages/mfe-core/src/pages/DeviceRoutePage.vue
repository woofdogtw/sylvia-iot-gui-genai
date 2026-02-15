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
      <q-btn flat round icon="add" :title="t('core.common.add')" @click="openAddDialog" />
      <q-btn flat round icon="download" :title="t('core.common.exportCsv')" @click="onExportCsv" />
    </div>

    <!-- Data Table -->
    <q-table
      :rows="rows" :columns="columns" :loading="loading"
      v-model:pagination="pagination" row-key="routeId"
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

    <!-- Add Dialog -->
    <q-dialog v-model="showAdd" @keyup.enter="submitAdd" @keyup.escape="showAdd = false">
      <q-card style="min-width: 450px">
        <q-card-section><div class="text-h6">{{ t('core.common.add') }}</div></q-card-section>
        <q-card-section>
          <q-form ref="addFormRef" greedy>
            <q-select v-model="addForm.unitId" :options="unitListOptions" :label="t('core.common.selectUnit')" dense outlined emit-value map-options class="q-mb-sm" @update:model-value="onAddUnitChange" />
            <q-select v-model="addForm.applicationId" :options="addAppOptions" :label="t('core.deviceRoute.applicationCode')" :rules="[ruleRequired]" dense outlined emit-value map-options class="q-mb-sm" />
            <q-select v-model="addForm.deviceId" :options="addDeviceOptions" :label="t('core.menu.device')" :rules="[ruleRequired]" dense outlined emit-value map-options class="q-mb-sm" />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('core.common.cancel')" @click="showAdd = false" />
          <q-btn flat color="primary" :label="t('core.common.ok')" @click="submitAdd" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Detail Dialog -->
    <q-dialog v-model="showDetail" @keyup.escape="showDetail = false">
      <q-card style="min-width: 450px">
        <q-card-section><div class="text-h6">{{ t('core.common.detail') }}</div></q-card-section>
        <q-card-section>
          <q-list dense>
            <q-item><q-item-section><q-item-label caption>{{ t('core.deviceRoute.applicationCode') }}</q-item-label><q-item-label>{{ detailItem.applicationCode }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.deviceRoute.networkCode') }}</q-item-label><q-item-label>{{ detailItem.networkCode }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.deviceRoute.networkAddr') }}</q-item-label><q-item-label>{{ detailItem.networkAddr }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.common.created') }}</q-item-label><q-item-label>{{ formatTime(detailItem.createdAt) }}</q-item-label></q-item-section></q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right"><q-btn flat :label="t('core.common.close')" @click="showDetail = false" /></q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Dialog -->
    <q-dialog v-model="showDelete" @keyup.enter="submitDelete" @keyup.escape="showDelete = false">
      <q-card>
        <q-card-section><div class="text-h6">{{ t('core.common.confirm') }}</div></q-card-section>
        <q-card-section>{{ t('core.common.deleteConfirm', { name: `${deleteItem.applicationCode} → ${deleteItem.networkAddr}` }) }}</q-card-section>
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
import { deviceRouteApi, unitApi, applicationApi, deviceApi } from '../api/index.js'
import { exportCsv } from '../utils/csv.js'
import { notifyApiError, notifySuccess } from '../utils/notify.js'
import { formatTime } from '../utils/format.js'

const { t } = useI18n()
const $q = useQuasar()
const { isAdminOrManager } = useRoles()

const selectedUnit = ref(null)
const unitOptions = ref([])
const unitListOptions = ref([])

async function loadUnits() {
  try {
    const res = await unitApi.list({ limit: 0 })
    const units = res.data?.data || []
    unitListOptions.value = units.map((u) => ({ label: u.code, value: u.unitId }))
    if (isAdminOrManager.value) {
      unitOptions.value = [{ label: t('core.common.allUnits'), value: null }, ...unitListOptions.value]
    } else {
      unitOptions.value = [...unitListOptions.value]
      if (unitListOptions.value.length) {
        selectedUnit.value = unitListOptions.value[0].value
        filterParams.unit = selectedUnit.value
      }
    }
  } catch { /* ignore */ }
}

function onUnitChange() { filterParams.unit = selectedUnit.value || undefined; refresh() }

const columns = computed(() => [
  { name: 'applicationCode', label: t('core.deviceRoute.applicationCode'), field: 'applicationCode', align: 'left', sortable: true },
  { name: 'networkCode', label: t('core.deviceRoute.networkCode'), field: 'networkCode', align: 'left' },
  { name: 'networkAddr', label: t('core.deviceRoute.networkAddr'), field: 'networkAddr', align: 'left' },
  { name: 'createdAt', label: t('core.common.created'), field: 'createdAtStr', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
])

const visibleColumns = computed(() => {
  const cols = ['applicationCode', 'networkCode', 'networkAddr', 'actions']
  if ($q.screen.gt.sm) cols.push('createdAt')
  return cols
})

const {
  rows, loading, pagination, filterParams, fetchData, onRequest, refresh,
} = useListPage({
  apiList: deviceRouteApi.list,
  apiCount: deviceRouteApi.count,
  mapRow: (row) => ({ ...row, createdAtStr: formatTime(row.createdAt) }),
})

function ruleRequired(val) { return !!val || t('core.validate.required') }

// ── Add ──
const showAdd = ref(false)
const addFormRef = ref(null)
const addForm = ref({ unitId: '', applicationId: '', deviceId: '' })
const addAppOptions = ref([])
const addDeviceOptions = ref([])

function openAddDialog() {
  const preUnit = selectedUnit.value || ''
  addForm.value = { unitId: preUnit, applicationId: '', deviceId: '' }
  addAppOptions.value = []; addDeviceOptions.value = []
  showAdd.value = true
  if (preUnit) onAddUnitChange(preUnit)
}

async function onAddUnitChange(unitId) {
  try {
    const [appRes, devRes] = await Promise.all([
      applicationApi.list({ unit: unitId, limit: 0 }),
      deviceApi.list({ unit: unitId, limit: 0 }),
    ])
    addAppOptions.value = (appRes.data?.data || []).map((a) => ({ label: a.code, value: a.applicationId }))
    addDeviceOptions.value = (devRes.data?.data || []).map((d) => ({ label: `${d.networkCode}:${d.networkAddr}`, value: d.deviceId }))
  } catch { addAppOptions.value = []; addDeviceOptions.value = [] }
}

async function submitAdd() {
  const valid = await addFormRef.value?.validate()
  if (!valid) return
  try {
    await deviceRouteApi.create({
      applicationId: addForm.value.applicationId,
      deviceId: addForm.value.deviceId,
    })
    notifySuccess(t('core.common.createSuccess'))
    showAdd.value = false
    refresh()
  } catch (err) { notifyApiError(err, t) }
}

// ── Detail / Delete ──
const showDetail = ref(false)
const detailItem = ref({})
function openDetailDialog(row) { detailItem.value = row; showDetail.value = true }

const showDelete = ref(false)
const deleteItem = ref({})
function openDeleteDialog(row) { deleteItem.value = row; showDelete.value = true }
async function submitDelete() {
  try { await deviceRouteApi.delete(deleteItem.value.routeId); notifySuccess(t('core.common.deleteSuccess')); showDelete.value = false; refresh() }
  catch (err) { notifyApiError(err, t) }
}

async function onExportCsv() {
  try { await exportCsv('/api/v1/device-route/list', 'device-routes.csv', filterParams) }
  catch (err) { notifyApiError(err, t) }
}

onMounted(async () => { await loadUnits(); fetchData() })
</script>
