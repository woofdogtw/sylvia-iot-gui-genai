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
      <q-btn
        v-if="isAdmin"
        flat
        round
        icon="add"
        :title="t('core.common.add')"
        @click="openAddDialog"
      />
      <q-btn
        flat
        round
        icon="download"
        :title="t('core.common.exportCsv')"
        @click="onExportCsv"
      />
    </div>

    <!-- Data Table -->
    <q-table
      :rows="rows"
      :columns="columns"
      :loading="loading"
      v-model:pagination="pagination"
      row-key="userId"
      :visible-columns="visibleColumns"
      :no-data-label="t('core.common.noData')"
      @request="onRequest"
    >
      <template #body-cell-roles="props">
        <q-td :props="props">
          {{ formatRoles(props.row.roles) }}
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn
            v-if="isAdmin"
            flat
            round
            dense
            icon="delete"
            size="sm"
            color="negative"
            @click="openDeleteDialog(props.row)"
          />
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
              v-model="addForm.account"
              :label="t('core.user.account')"
              :rules="[ruleRequired, ruleCode]"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-input
              v-model="addForm.password"
              :label="t('core.common.password')"
              :rules="[ruleRequired]"
              type="password"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-input
              v-model="addForm.name"
              :label="t('core.user.name')"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-input
              v-model="addForm.info"
              :label="t('core.user.info')"
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
              v-model="editForm.password"
              :label="t('core.common.password')"
              type="password"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-input
              v-model="editForm.name"
              :label="t('core.user.name')"
              dense
              outlined
              class="q-mb-sm"
            />
            <!-- Roles: admin only -->
            <div v-if="isAdmin" class="q-mb-sm">
              <div class="text-caption q-mb-xs">{{ t('core.user.roles') }}</div>
              <q-checkbox v-model="editForm.roles.admin" :label="t('core.user.admin')" />
              <q-checkbox v-model="editForm.roles.manager" :label="t('core.user.manager')" />
              <q-checkbox v-model="editForm.roles.service" :label="t('core.user.service')" />
              <q-checkbox v-model="editForm.roles.dev" :label="t('core.user.dev')" />
            </div>
            <q-input
              v-model="editForm.info"
              :label="t('core.user.info')"
              :rules="[ruleJson]"
              type="textarea"
              dense
              outlined
              autogrow
              class="q-mb-sm"
            />
            <!-- Disable: admin can always toggle; manager only for service/user roles -->
            <q-toggle
              v-if="canToggleDisable"
              v-model="editForm.disabled"
              :label="t('core.user.disable')"
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
                <q-item-label caption>{{ t('core.user.account') }}</q-item-label>
                <q-item-label>{{ detailItem.account }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.user.name') }}</q-item-label>
                <q-item-label>{{ detailItem.name || '-' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.user.roles') }}</q-item-label>
                <q-item-label>{{ formatRoles(detailItem.roles) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.user.disable') }}</q-item-label>
                <q-item-label>{{ detailItem.disabled ? t('core.common.yes') : t('core.common.no') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.user.info') }}</q-item-label>
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
          {{ t('core.common.deleteConfirm', { name: deleteItem.account }) }}
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
import { userApi } from '../api/index.js'
import { validateCode, validateJsonObject, parseJsonInfo, trimValue } from '../utils/validate.js'
import { exportCsv } from '../utils/csv.js'
import { notifyApiError, notifySuccess } from '../utils/notify.js'
import { formatTime } from '../utils/format.js'

const { t } = useI18n()
const $q = useQuasar()
const { isAdmin, isManager, isAdminOrManager } = useRoles()

const columns = computed(() => [
  { name: 'account', label: t('core.user.account'), field: 'account', align: 'left', sortable: true },
  { name: 'name', label: t('core.user.name'), field: 'name', align: 'left', sortable: true },
  { name: 'roles', label: t('core.user.roles'), field: 'roles', align: 'left' },
  { name: 'createdAt', label: t('core.common.created'), field: 'createdAtStr', align: 'left', sortable: true },
  { name: 'modifiedAt', label: t('core.common.modified'), field: 'modifiedAtStr', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
])

const visibleColumns = computed(() => {
  const cols = ['account', 'name', 'roles', 'actions']
  if ($q.screen.gt.sm) {
    cols.push('createdAt', 'modifiedAt')
  }
  return cols
})

const {
  rows,
  loading,
  pagination,
  filterParams,
  fetchData,
  onRequest,
  refresh,
} = useListPage({
  apiList: userApi.list,
  apiCount: userApi.count,
  mapRow: (row) => ({ ...row, createdAtStr: formatTime(row.createdAt), modifiedAtStr: formatTime(row.modifiedAt) }),
})

// Search
const searchText = ref('')
function onSearch() {
  filterParams.contains = trimValue(searchText.value) || undefined
  refresh()
}

// Format helpers
function formatRoles(roles) {
  if (!roles) return ''
  return ['admin', 'manager', 'service', 'dev']
    .filter((r) => roles[r])
    .map((r) => t(`core.user.${r}`))
    .join(', ')
}

function formatJson(val) {
  if (!val || (typeof val === 'object' && Object.keys(val).length === 0)) return '{}'
  return typeof val === 'string' ? val : JSON.stringify(val, null, 2)
}

// Validation rules
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

// ── Add Dialog ──
const showAdd = ref(false)
const addFormRef = ref(null)
const addForm = ref({ account: '', password: '', name: '', info: '' })

function openAddDialog() {
  addForm.value = { account: '', password: '', name: '', info: '' }
  showAdd.value = true
}

async function submitAdd() {
  const valid = await addFormRef.value?.validate()
  if (!valid) return
  try {
    const data = {
      account: trimValue(addForm.value.account),
      password: addForm.value.password,
    }
    const name = trimValue(addForm.value.name)
    if (name) data.name = name
    data.info = parseJsonInfo(addForm.value.info)
    await userApi.create(data)
    notifySuccess(t('core.common.createSuccess'))
    showAdd.value = false
    refresh()
  } catch (err) {
    notifyApiError(err, t)
  }
}

// ── Edit Dialog ──
const showEdit = ref(false)
const editFormRef = ref(null)
const editForm = ref({ password: '', name: '', roles: {}, info: '', disabled: false })
const editingUser = ref(null)

const canToggleDisable = computed(() => {
  if (isAdmin.value) return true
  if (!isManager.value) return false
  // Manager can only disable service or user roles (not admin/manager)
  const r = editingUser.value?.roles || {}
  return !r.admin && !r.manager
})

function openEditDialog(row) {
  editingUser.value = row
  editForm.value = {
    password: '',
    name: row.name || '',
    roles: { ...(row.roles || {}) },
    info: row.info ? JSON.stringify(row.info, null, 2) : '',
    disabled: !!row.disabledAt,
  }
  showEdit.value = true
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate()
  if (!valid) return
  try {
    const data = {}
    if (editForm.value.password) data.password = editForm.value.password
    data.name = trimValue(editForm.value.name)
    if (isAdmin.value) {
      data.roles = editForm.value.roles
    }
    data.info = parseJsonInfo(editForm.value.info)
    const opts = {}
    if (canToggleDisable.value) {
      const wasDisabled = !!editingUser.value.disabledAt
      if (editForm.value.disabled !== wasDisabled) {
        opts.disable = editForm.value.disabled
      }
    }
    await userApi.update(editingUser.value.userId, data, opts)
    notifySuccess(t('core.common.updateSuccess'))
    showEdit.value = false
    refresh()
  } catch (err) {
    notifyApiError(err, t)
  }
}

// ── Detail Dialog ──
const showDetail = ref(false)
const detailItem = ref({})

function openDetailDialog(row) {
  detailItem.value = row
  showDetail.value = true
}

// ── Delete Dialog ──
const showDelete = ref(false)
const deleteItem = ref({})

function openDeleteDialog(row) {
  deleteItem.value = row
  showDelete.value = true
}

async function submitDelete() {
  try {
    await userApi.delete(deleteItem.value.userId)
    notifySuccess(t('core.common.deleteSuccess'))
    showDelete.value = false
    refresh()
  } catch (err) {
    notifyApiError(err, t)
  }
}

// ── CSV Export ──
async function onExportCsv() {
  try {
    await exportCsv('/api/v1/user/list', 'users.csv', filterParams)
  } catch (err) {
    notifyApiError(err, t)
  }
}

// Initial load
onMounted(fetchData)
</script>
