<template>
  <q-page padding>
    <!-- Toolbar -->
    <div class="row q-mb-md q-gutter-sm items-center">
      <q-input
        v-model="searchText"
        :placeholder="t('core.common.search')"
        dense
        outlined
        class="col-auto"
        style="min-width: 200px"
        @keyup.enter="onSearch"
      >
        <template #append>
          <q-icon name="search" class="cursor-pointer" @click="onSearch" />
        </template>
      </q-input>
      <q-space />
      <q-btn flat round icon="refresh" :title="t('core.common.refresh')" @click="refresh" />
      <q-btn flat round icon="add" :title="t('core.common.add')" @click="openAddDialog" />
      <q-btn flat round icon="download" :title="t('core.common.exportCsv')" @click="onExportCsv" />
    </div>

    <!-- Data Table -->
    <q-table
      :rows="rows"
      :columns="columns"
      :loading="loading"
      v-model:pagination="pagination"
      row-key="unitId"
      :visible-columns="visibleColumns"
      :no-data-label="t('core.common.noData')"
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
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ t('core.common.add') }}</div>
        </q-card-section>
        <q-card-section>
          <q-form ref="addFormRef" greedy>
            <q-input
              v-model="addForm.code"
              :label="t('core.unit.code')"
              :rules="[ruleRequired, ruleCode]"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-input
              v-model="addForm.name"
              :label="t('core.unit.name')"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-select
              v-if="isAdminOrManager"
              v-model="addForm.ownerId"
              :label="t('core.unit.owner')"
              :options="userOptions"
              use-input
              input-debounce="500"
              emit-value
              map-options
              dense
              outlined
              clearable
              class="q-mb-sm"
              @filter="onFilterUsers"
            />
            <q-input
              v-model="addForm.info"
              :label="t('core.unit.info')"
              :rules="[ruleJson]"
              type="textarea"
              dense
              outlined
              autogrow
            />
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
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ t('core.common.edit') }}</div>
        </q-card-section>
        <q-card-section>
          <q-form ref="editFormRef" greedy>
            <q-input
              v-model="editForm.name"
              :label="t('core.unit.name')"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-select
              v-if="isAdminOrManager"
              v-model="editForm.ownerId"
              :label="t('core.unit.owner')"
              :options="userOptions"
              use-input
              input-debounce="500"
              emit-value
              map-options
              dense
              outlined
              clearable
              class="q-mb-sm"
              @filter="onFilterUsers"
            />
            <q-input
              v-model="editForm.info"
              :label="t('core.unit.info')"
              :rules="[ruleJson]"
              type="textarea"
              dense
              outlined
              autogrow
            />
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
        <q-card-section>
          <div class="text-h6">{{ t('core.common.detail') }}</div>
        </q-card-section>
        <q-card-section>
          <q-list dense>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.unit.code') }}</q-item-label>
                <q-item-label>{{ detailItem.code }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.unit.name') }}</q-item-label>
                <q-item-label>{{ detailItem.name || '-' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="isAdminOrManager">
              <q-item-section>
                <q-item-label caption>{{ t('core.unit.owner') }}</q-item-label>
                <q-item-label>{{ resolvedOwner || detailItem.ownerId || '-' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.unit.info') }}</q-item-label>
                <q-item-label style="white-space: pre-wrap">{{ formatJson(detailItem.info) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.common.created') }}</q-item-label>
                <q-item-label>{{ formatTime(detailItem.createdAt) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.common.modified') }}</q-item-label>
                <q-item-label>{{ formatTime(detailItem.modifiedAt) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('core.common.close')" @click="showDetail = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Dialog -->
    <q-dialog v-model="showDelete" @keyup.enter="submitDelete" @keyup.escape="showDelete = false">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t('core.common.confirm') }}</div>
        </q-card-section>
        <q-card-section>
          <div>{{ t('core.common.deleteConfirm', { name: deleteItem.code }) }}</div>
          <div class="text-negative q-mt-sm">{{ t('core.unit.deleteWarn') }}</div>
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
import { unitApi, userApi } from '../api/index.js'
import { validateCode, validateJsonObject, parseJsonInfo, trimValue } from '../utils/validate.js'
import { exportCsv } from '../utils/csv.js'
import { notifyApiError, notifySuccess } from '../utils/notify.js'
import { formatTime } from '../utils/format.js'

const { t } = useI18n()
const $q = useQuasar()
const { isAdminOrManager } = useRoles()

const columns = computed(() => [
  { name: 'code', label: t('core.unit.code'), field: 'code', align: 'left', sortable: true },
  { name: 'name', label: t('core.unit.name'), field: 'name', align: 'left', sortable: true },
  { name: 'ownerId', label: t('core.unit.owner'), field: 'ownerDisplay', align: 'left' },
  { name: 'createdAt', label: t('core.common.created'), field: 'createdAtStr', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
])

const visibleColumns = computed(() => {
  const cols = ['code', 'name', 'actions']
  if ($q.screen.gt.sm) {
    if (isAdminOrManager.value) cols.push('ownerId')
    cols.push('createdAt')
  }
  return cols
})

// Resolve owner IDs to account names for the table
const ownerCache = {}
async function resolveOwnerColumns(rowsRef) {
  if (!isAdminOrManager.value || !rowsRef.value.length) return
  const idsToResolve = [...new Set(
    rowsRef.value.filter((r) => r.ownerId && !ownerCache[r.ownerId]).map((r) => r.ownerId),
  )]
  if (idsToResolve.length) {
    await Promise.all(idsToResolve.map(async (id) => {
      try {
        const res = await userApi.get(id)
        const u = res.data?.data
        ownerCache[id] = u ? u.account + (u.name ? ` (${u.name})` : '') : id
      } catch {
        ownerCache[id] = id
      }
    }))
  }
  for (const row of rowsRef.value) {
    if (row.ownerId && ownerCache[row.ownerId]) {
      row.ownerDisplay = ownerCache[row.ownerId]
    }
  }
}

const {
  rows, loading, pagination, filterParams, fetchData, onRequest, refresh,
} = useListPage({
  apiList: unitApi.list,
  apiCount: unitApi.count,
  mapRow: (row) => ({ ...row, createdAtStr: formatTime(row.createdAt), ownerDisplay: row.ownerId || '' }),
  postFetch: resolveOwnerColumns,
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

function ruleRequired(val) {
  return !!val || t('core.validate.required')
}
function ruleCode(val) {
  const result = validateCode(val)
  return result === true ? true : t(result)
}
function ruleJson(val) {
  const result = validateJsonObject(val)
  return result === true ? true : t(result)
}

// ── User autocomplete for admin/manager ──
const userOptions = ref([])

function onFilterUsers(val, update) {
  const needle = val.trim()
  if (!needle) {
    update(() => { userOptions.value = [] })
    return
  }
  userApi.list({ contains: needle, limit: 10 }).then((res) => {
    update(() => {
      userOptions.value = (res.data?.data || []).map((u) => ({
        label: u.account + (u.name ? ` (${u.name})` : ''),
        value: u.userId,
      }))
    })
  }).catch(() => {
    update(() => { userOptions.value = [] })
  })
}

const resolvedOwner = ref('')

async function resolveOwner(ownerId) {
  if (!ownerId) {
    resolvedOwner.value = ''
    return
  }
  try {
    const res = await userApi.get(ownerId)
    const u = res.data?.data
    resolvedOwner.value = u ? u.account + (u.name ? ` (${u.name})` : '') : ownerId
  } catch {
    resolvedOwner.value = ownerId
  }
}

// ── Add ──
const showAdd = ref(false)
const addFormRef = ref(null)
const addForm = ref({ code: '', name: '', ownerId: null, info: '' })

function openAddDialog() {
  addForm.value = { code: '', name: '', ownerId: null, info: '' }
  userOptions.value = []
  showAdd.value = true
}

async function submitAdd() {
  const valid = await addFormRef.value?.validate()
  if (!valid) return
  try {
    const data = { code: trimValue(addForm.value.code) }
    const name = trimValue(addForm.value.name)
    if (name) data.name = name
    if (addForm.value.ownerId) data.ownerId = addForm.value.ownerId
    data.info = parseJsonInfo(addForm.value.info)
    await unitApi.create(data)
    notifySuccess(t('core.common.createSuccess'))
    showAdd.value = false
    refresh()
  } catch (err) {
    notifyApiError(err, t)
  }
}

// ── Edit ──
const showEdit = ref(false)
const editFormRef = ref(null)
const editForm = ref({ name: '', ownerId: '', info: '' })
const editingUnit = ref(null)

async function openEditDialog(row) {
  editingUnit.value = row
  editForm.value = {
    name: row.name || '',
    ownerId: row.ownerId || null,
    info: row.info ? JSON.stringify(row.info, null, 2) : '',
  }
  userOptions.value = []
  if (row.ownerId && isAdminOrManager.value) {
    await resolveOwner(row.ownerId)
    userOptions.value = [{ label: resolvedOwner.value, value: row.ownerId }]
  }
  showEdit.value = true
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate()
  if (!valid) return
  try {
    const data = { name: trimValue(editForm.value.name) }
    if (isAdminOrManager.value && editForm.value.ownerId) {
      data.ownerId = editForm.value.ownerId
    }
    data.info = parseJsonInfo(editForm.value.info)
    await unitApi.update(editingUnit.value.unitId, data)
    notifySuccess(t('core.common.updateSuccess'))
    showEdit.value = false
    refresh()
  } catch (err) {
    notifyApiError(err, t)
  }
}

// ── Detail ──
const showDetail = ref(false)
const detailItem = ref({})
async function openDetailDialog(row) {
  detailItem.value = row
  showDetail.value = true
  await resolveOwner(row.ownerId)
}

// ── Delete ──
const showDelete = ref(false)
const deleteItem = ref({})
function openDeleteDialog(row) { deleteItem.value = row; showDelete.value = true }

async function submitDelete() {
  try {
    await unitApi.delete(deleteItem.value.unitId)
    notifySuccess(t('core.common.deleteSuccess'))
    showDelete.value = false
    refresh()
  } catch (err) {
    notifyApiError(err, t)
  }
}

async function onExportCsv() {
  try {
    await exportCsv('/api/v1/unit/list', 'units.csv', filterParams)
  } catch (err) {
    notifyApiError(err, t)
  }
}

onMounted(fetchData)
</script>
