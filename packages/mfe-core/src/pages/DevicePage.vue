<template>
  <q-page padding>
    <!-- Toolbar -->
    <div class="row q-mb-md q-gutter-sm items-center">
      <q-select
        v-model="selectedUnit" :options="unitOptions" :label="t('core.common.selectUnit')"
        dense outlined emit-value map-options class="col-auto" style="min-width: 180px"
        @update:model-value="onUnitChange"
      />
      <q-input
        v-model="searchText" :placeholder="t('core.common.search')" dense outlined
        class="col-auto" style="min-width: 200px" @keyup.enter="onSearch"
      >
        <template #append><q-icon name="search" class="cursor-pointer" @click="onSearch" /></template>
      </q-input>
      <q-space />
      <q-btn flat round icon="refresh" :title="t('core.common.refresh')" @click="refresh" />
      <q-btn flat round icon="add" :title="t('core.common.add')" @click="openAddDialog" />
      <q-btn flat round icon="download" :title="t('core.common.exportCsv')" @click="onExportCsv" />
    </div>

    <!-- Data Table -->
    <q-table
      :rows="rows" :columns="columns" :loading="loading"
      v-model:pagination="pagination" row-key="deviceId"
      :visible-columns="visibleColumns" :no-data-label="t('core.common.noData')"
      @request="onRequest"
    >
      <template #body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn flat round dense icon="delete" size="sm" color="negative" @click="openDeleteDialog(props.row)" />
          <q-btn flat round dense icon="edit" size="sm" @click="openEditDialog(props.row)" />
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
            <q-select v-model="addForm.unitId" :options="unitListOptions" :label="t('core.application.unitId')" :rules="[ruleRequired]" dense outlined emit-value map-options class="q-mb-sm" @update:model-value="onAddUnitChange" />
            <q-select v-model="addForm.networkId" :options="addNetworkOptions" :label="t('core.device.networkCode')" :rules="[ruleRequired]" dense outlined emit-value map-options class="q-mb-sm" />
            <q-input v-model="addForm.networkAddr" :label="t('core.device.networkAddr')" :rules="[ruleRequired]" dense outlined class="q-mb-sm" />
            <q-input v-model="addForm.profile" :label="t('core.device.profile')" dense outlined class="q-mb-sm" />
            <q-input v-model="addForm.name" :label="t('core.device.name')" dense outlined class="q-mb-sm" />
            <q-input v-model="addForm.info" :label="t('core.device.info')" :rules="[ruleJson]" type="textarea" dense outlined autogrow />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('core.common.cancel')" @click="showAdd = false" />
          <q-btn flat color="primary" :label="t('core.common.ok')" @click="submitAdd" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEdit" @keyup.enter="submitEdit" @keyup.escape="showEdit = false">
      <q-card style="min-width: 450px">
        <q-card-section><div class="text-h6">{{ t('core.common.edit') }}</div></q-card-section>
        <q-card-section>
          <q-form ref="editFormRef" greedy>
            <q-input v-model="editForm.networkAddr" :label="t('core.device.networkAddr')" dense outlined class="q-mb-sm" />
            <q-input v-model="editForm.profile" :label="t('core.device.profile')" dense outlined class="q-mb-sm" />
            <q-input v-model="editForm.name" :label="t('core.device.name')" dense outlined class="q-mb-sm" />
            <q-input v-model="editForm.info" :label="t('core.device.info')" :rules="[ruleJson]" type="textarea" dense outlined autogrow />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('core.common.cancel')" @click="showEdit = false" />
          <q-btn flat color="primary" :label="t('core.common.ok')" @click="submitEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Detail Dialog -->
    <q-dialog v-model="showDetail" @keyup.escape="showDetail = false">
      <q-card style="min-width: 450px">
        <q-card-section><div class="text-h6">{{ t('core.common.detail') }}</div></q-card-section>
        <q-card-section>
          <q-list dense>
            <q-item><q-item-section><q-item-label caption>{{ t('core.device.networkCode') }}</q-item-label><q-item-label>{{ detailItem.networkCode }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.device.networkAddr') }}</q-item-label><q-item-label>{{ detailItem.networkAddr }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.device.name') }}</q-item-label><q-item-label>{{ detailItem.name || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.device.profile') }}</q-item-label><q-item-label>{{ detailItem.profile || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.device.info') }}</q-item-label><q-item-label style="white-space: pre-wrap">{{ formatJson(detailItem.info) }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.common.created') }}</q-item-label><q-item-label>{{ formatTime(detailItem.createdAt) }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.common.modified') }}</q-item-label><q-item-label>{{ formatTime(detailItem.modifiedAt) }}</q-item-label></q-item-section></q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right"><q-btn flat :label="t('core.common.close')" @click="showDetail = false" /></q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Dialog -->
    <q-dialog v-model="showDelete" @keyup.enter="submitDelete" @keyup.escape="showDelete = false">
      <q-card>
        <q-card-section><div class="text-h6">{{ t('core.common.confirm') }}</div></q-card-section>
        <q-card-section>
          <div>{{ t('core.common.deleteConfirm', { name: deleteItem.networkAddr }) }}</div>
          <div class="text-negative q-mt-sm">{{ t('core.device.deleteWarn') }}</div>
        </q-card-section>
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
import { deviceApi, unitApi, networkApi } from '../api/index.js'
import { validateJsonObject, parseJsonInfo, trimValue } from '../utils/validate.js'
import { exportCsv } from '../utils/csv.js'
import { notifyApiError, notifySuccess } from '../utils/notify.js'
import { formatTime } from '../utils/format.js'

const { t } = useI18n()
const $q = useQuasar()
const { isAdminOrManager } = useRoles()

// ── Unit/Network selectors ──
const selectedUnit = ref(null)
const unitOptions = ref([])
const unitListOptions = ref([])
const addNetworkOptions = ref([])

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

function onUnitChange() {
  filterParams.unit = selectedUnit.value || undefined
  refresh()
}

async function onAddUnitChange(unitId) {
  try {
    const res = await networkApi.list({ unit: unitId, limit: 0 })
    addNetworkOptions.value = (res.data?.data || []).map((n) => ({ label: n.code, value: n.networkId }))
  } catch { addNetworkOptions.value = [] }
}

// ── Table ──
const columns = computed(() => [
  { name: 'networkCode', label: t('core.device.networkCode'), field: 'networkCode', align: 'left' },
  { name: 'networkAddr', label: t('core.device.networkAddr'), field: 'networkAddr', align: 'left', sortable: true },
  { name: 'name', label: t('core.device.name'), field: 'name', align: 'left', sortable: true },
  { name: 'profile', label: t('core.device.profile'), field: 'profile', align: 'left' },
  { name: 'createdAt', label: t('core.common.created'), field: 'createdAtStr', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
])

const visibleColumns = computed(() => {
  const cols = ['networkCode', 'networkAddr', 'name', 'actions']
  if ($q.screen.gt.sm) cols.push('profile', 'createdAt')
  return cols
})

const {
  rows, loading, pagination, filterParams, fetchData, onRequest, refresh,
} = useListPage({
  apiList: deviceApi.list,
  apiCount: deviceApi.count,
  mapRow: (row) => ({ ...row, createdAtStr: formatTime(row.createdAt) }),
})

const searchText = ref('')
function onSearch() {
  filterParams.contains = trimValue(searchText.value) || undefined
  refresh()
}

function formatJson(val) {
  if (!val || (typeof val === 'object' && Object.keys(val).length === 0)) return '{}'
  return typeof val === 'string' ? val : JSON.stringify(val, null, 2)
}
function ruleRequired(val) { return !!val || t('core.validate.required') }
function ruleJson(val) { const r = validateJsonObject(val); return r === true ? true : t(r) }

// ── Add ──
const showAdd = ref(false)
const addFormRef = ref(null)
const addForm = ref({ unitId: '', networkId: '', networkAddr: '', profile: '', name: '', info: '' })

function openAddDialog() {
  const preUnit = selectedUnit.value || ''
  addForm.value = { unitId: preUnit, networkId: '', networkAddr: '', profile: '', name: '', info: '' }
  addNetworkOptions.value = []
  showAdd.value = true
  if (preUnit) onAddUnitChange(preUnit)
}

async function submitAdd() {
  const valid = await addFormRef.value?.validate()
  if (!valid) return
  try {
    const data = {
      unitId: addForm.value.unitId,
      networkId: addForm.value.networkId,
      networkAddr: trimValue(addForm.value.networkAddr),
    }
    const profile = trimValue(addForm.value.profile)
    if (profile) data.profile = profile
    const name = trimValue(addForm.value.name)
    if (name) data.name = name
    data.info = parseJsonInfo(addForm.value.info)
    await deviceApi.create(data)
    notifySuccess(t('core.common.createSuccess'))
    showAdd.value = false
    refresh()
  } catch (err) { notifyApiError(err, t) }
}

// ── Edit ──
const showEdit = ref(false)
const editFormRef = ref(null)
const editForm = ref({ networkAddr: '', profile: '', name: '', info: '' })
const editingDevice = ref(null)

function openEditDialog(row) {
  editingDevice.value = row
  editForm.value = {
    networkAddr: row.networkAddr || '',
    profile: row.profile || '',
    name: row.name || '',
    info: row.info ? JSON.stringify(row.info, null, 2) : '',
  }
  showEdit.value = true
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate()
  if (!valid) return
  try {
    const data = {
      networkAddr: trimValue(editForm.value.networkAddr),
      profile: trimValue(editForm.value.profile),
      name: trimValue(editForm.value.name),
      info: parseJsonInfo(editForm.value.info),
    }
    await deviceApi.update(editingDevice.value.deviceId, data)
    notifySuccess(t('core.common.updateSuccess'))
    showEdit.value = false
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
  try { await deviceApi.delete(deleteItem.value.deviceId); notifySuccess(t('core.common.deleteSuccess')); showDelete.value = false; refresh() }
  catch (err) { notifyApiError(err, t) }
}

async function onExportCsv() {
  try { await exportCsv('/api/v1/device/list', 'devices.csv', filterParams) }
  catch (err) { notifyApiError(err, t) }
}

onMounted(async () => { await loadUnits(); fetchData() })
</script>
