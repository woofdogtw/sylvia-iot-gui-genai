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
      row-key="clientId"
      :visible-columns="visibleColumns"
      :no-data-label="t('core.common.noData')"
      @request="onRequest"
    >
      <template #body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn
            v-if="canDelete(props.row)"
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
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">{{ t('core.common.add') }}</div>
        </q-card-section>
        <q-card-section>
          <q-form ref="addFormRef" greedy>
            <q-select
              v-if="isAdmin"
              v-model="addForm.userId"
              :label="t('core.client.userId')"
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
              v-model="addForm.name"
              :label="t('core.client.name')"
              :rules="[ruleRequired]"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-input
              v-model="addForm.redirectUris"
              :label="t('core.client.redirectUris')"
              :rules="[ruleRequired]"
              hint="Comma-separated"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-input
              v-model="addForm.scopes"
              :label="t('core.client.scopes')"
              hint="Comma-separated"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-input
              v-model="addForm.imageUrl"
              :label="t('core.client.imageUrl')"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-toggle
              v-model="addForm.credentials"
              :label="t('core.client.credentials')"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('core.common.cancel')" @click="showAdd = false" />
          <q-btn flat color="primary" :label="t('core.common.ok')" @click="submitAdd" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Secret Display Dialog -->
    <q-dialog v-model="showSecret" @keyup.escape="showSecret = false">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ t('core.client.secret') }}</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="secretValue"
            :type="secretVisible ? 'text' : 'password'"
            readonly
            outlined
            dense
          >
            <template #append>
              <q-icon
                :name="secretVisible ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="secretVisible = !secretVisible"
              />
              <q-icon name="content_copy" class="cursor-pointer q-ml-sm" @click="copySecret" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('core.common.close')" @click="showSecret = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEdit" @keyup.enter="submitEdit" @keyup.escape="showEdit = false">
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">{{ t('core.common.edit') }}</div>
        </q-card-section>
        <q-card-section>
          <q-form ref="editFormRef" greedy>
            <q-input
              v-if="isAdmin && resolvedAccount"
              :model-value="resolvedAccount"
              :label="t('core.client.userId')"
              dense
              outlined
              readonly
              class="q-mb-sm"
            />
            <q-input
              v-model="editForm.name"
              :label="t('core.client.name')"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-input
              v-model="editForm.redirectUris"
              :label="t('core.client.redirectUris')"
              hint="Comma-separated"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-input
              v-model="editForm.scopes"
              :label="t('core.client.scopes')"
              hint="Comma-separated"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-input
              v-model="editForm.imageUrl"
              :label="t('core.client.imageUrl')"
              dense
              outlined
              class="q-mb-sm"
            />
            <q-btn
              v-if="editingClient?.clientSecret"
              flat
              color="warning"
              :label="t('core.client.regenerateSecret')"
              @click="regenerateSecret"
              class="q-mt-sm"
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
            <q-item v-if="isAdmin && resolvedAccount">
              <q-item-section>
                <q-item-label caption>{{ t('core.client.userId') }}</q-item-label>
                <q-item-label>{{ resolvedAccount }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.client.clientId') }}</q-item-label>
                <q-item-label>{{ detailItem.clientId }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.client.name') }}</q-item-label>
                <q-item-label>{{ detailItem.name || '-' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.client.type') }}</q-item-label>
                <q-item-label>{{ detailItem.clientSecret ? t('core.client.private') : t('core.client.public') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="detailItem.clientSecret">
              <q-item-section>
                <q-item-label caption>{{ t('core.client.secret') }}</q-item-label>
                <q-input
                  :model-value="detailItem.clientSecret"
                  :type="detailSecretVisible ? 'text' : 'password'"
                  readonly
                  dense
                  borderless
                >
                  <template #append>
                    <q-icon
                      :name="detailSecretVisible ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="detailSecretVisible = !detailSecretVisible"
                    />
                    <q-icon
                      name="content_copy"
                      class="cursor-pointer q-ml-sm"
                      @click="copyToClipboard(detailItem.clientSecret); notifySuccess(t('core.common.copied'))"
                    />
                  </template>
                </q-input>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.client.redirectUris') }}</q-item-label>
                <q-item-label>{{ (detailItem.redirectUris || []).join(', ') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.client.scopes') }}</q-item-label>
                <q-item-label>{{ (detailItem.scopes || []).join(', ') || '-' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.client.imageUrl') }}</q-item-label>
                <q-item-label>{{ detailItem.image || '-' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ t('core.common.created') }}</q-item-label>
                <q-item-label>{{ formatTime(detailItem.createdAt) }}</q-item-label>
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
          {{ t('core.common.deleteConfirm', { name: deleteItem.name ? `${deleteItem.name} (${deleteItem.clientId})` : deleteItem.clientId }) }}
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
import { useQuasar, copyToClipboard } from 'quasar'
import { useListPage } from '../composables/useListPage.js'
import { useRoles } from '../composables/useRoles.js'
import { clientApi, userApi } from '../api/index.js'
import { trimValue } from '../utils/validate.js'
import { exportCsv } from '../utils/csv.js'
import { notifyApiError, notifySuccess } from '../utils/notify.js'
import { formatTime } from '../utils/format.js'

const { t } = useI18n()
const $q = useQuasar()
const { isAdmin, isDev } = useRoles()

// Current user's client ID (to prevent self-deletion)
const currentClientId = computed(() => window.config?.auth?.clientId || '')

const columns = computed(() => [
  { name: 'clientId', label: t('core.client.clientId'), field: 'clientId', align: 'left', sortable: true },
  { name: 'name', label: t('core.client.name'), field: 'name', align: 'left', sortable: true },
  { name: 'type', label: t('core.client.type'), field: (row) => row.clientSecret ? t('core.client.private') : t('core.client.public'), align: 'left' },
  { name: 'createdAt', label: t('core.common.created'), field: 'createdAtStr', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
])

const visibleColumns = computed(() => {
  const cols = ['clientId', 'name', 'type', 'actions']
  if ($q.screen.gt.sm) cols.push('createdAt')
  return cols
})

const {
  rows, loading, pagination, filterParams, fetchData, onRequest, refresh,
} = useListPage({
  apiList: clientApi.list,
  apiCount: clientApi.count,
  mapRow: (row) => ({ ...row, createdAtStr: formatTime(row.createdAt) }),
})

// Search
const searchText = ref('')
function onSearch() {
  filterParams.contains = trimValue(searchText.value) || undefined
  refresh()
}

function canDelete(row) {
  return row.clientId !== currentClientId.value
}

// Validation
function ruleRequired(val) {
  return !!val || t('core.validate.required')
}

// ── User autocomplete for admin ──
const userOptions = ref([])

function onFilterUsers(val, update, abort) {
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

// ── Add Dialog ──
const showAdd = ref(false)
const addFormRef = ref(null)
const addForm = ref({ userId: null, name: '', redirectUris: '', scopes: '', imageUrl: '', credentials: false })

function openAddDialog() {
  addForm.value = { userId: null, name: '', redirectUris: '', scopes: '', imageUrl: '', credentials: false }
  userOptions.value = []
  showAdd.value = true
}

async function submitAdd() {
  const valid = await addFormRef.value?.validate()
  if (!valid) return
  try {
    const data = {
      name: trimValue(addForm.value.name),
      redirectUris: addForm.value.redirectUris.split(',').map((s) => s.trim()).filter(Boolean),
    }
    data.scopes = addForm.value.scopes.split(',').map((s) => s.trim()).filter(Boolean)
    const image = trimValue(addForm.value.imageUrl)
    if (image) data.image = image
    if (addForm.value.userId) data.userId = addForm.value.userId
    const res = await clientApi.create(data, { credentials: addForm.value.credentials })
    showAdd.value = false
    // Show secret if credentials enabled
    if (addForm.value.credentials && res.data?.data?.secret) {
      secretValue.value = res.data.data.secret
      secretVisible.value = false
      showSecret.value = true
    }
    notifySuccess(t('core.common.createSuccess'))
    refresh()
  } catch (err) {
    notifyApiError(err, t)
  }
}

// ── Secret Display ──
const showSecret = ref(false)
const secretValue = ref('')
const secretVisible = ref(false)

function copySecret() {
  copyToClipboard(secretValue.value)
  notifySuccess(t('core.common.copied'))
}

// ── Edit Dialog ──
const showEdit = ref(false)
const editFormRef = ref(null)
const editForm = ref({ name: '', redirectUris: '', scopes: '', imageUrl: '' })
const editingClient = ref(null)

async function openEditDialog(row) {
  editingClient.value = row
  editForm.value = {
    name: row.name || '',
    redirectUris: (row.redirectUris || []).join(', '),
    scopes: (row.scopes || []).join(', '),
    imageUrl: row.image || '',
  }
  showEdit.value = true
  await resolveUser(row.userId)
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate()
  if (!valid) return
  try {
    const data = {
      name: trimValue(editForm.value.name),
      redirectUris: editForm.value.redirectUris.split(',').map((s) => s.trim()).filter(Boolean),
    }
    const scopes = editForm.value.scopes.split(',').map((s) => s.trim()).filter(Boolean)
    data.scopes = scopes
    const image = trimValue(editForm.value.imageUrl)
    data.image = image || null
    await clientApi.update(editingClient.value.clientId, data)
    notifySuccess(t('core.common.updateSuccess'))
    showEdit.value = false
    refresh()
  } catch (err) {
    notifyApiError(err, t)
  }
}

async function regenerateSecret() {
  try {
    const res = await clientApi.update(editingClient.value.clientId, {}, { regenSecret: true })
    if (res.data?.data?.secret) {
      secretValue.value = res.data.data.secret
      secretVisible.value = false
      showSecret.value = true
    }
    showEdit.value = false
    refresh()
  } catch (err) {
    notifyApiError(err, t)
  }
}

// ── Resolve userId to account ──
const resolvedAccount = ref('')

async function resolveUser(userId) {
  if (!userId || !isAdmin.value) {
    resolvedAccount.value = ''
    return
  }
  try {
    const res = await userApi.get(userId)
    const u = res.data?.data
    resolvedAccount.value = u ? u.account + (u.name ? ` (${u.name})` : '') : userId
  } catch {
    resolvedAccount.value = userId
  }
}

// ── Detail Dialog ──
const showDetail = ref(false)
const detailItem = ref({})
const detailSecretVisible = ref(false)

async function openDetailDialog(row) {
  detailItem.value = row
  detailSecretVisible.value = false
  showDetail.value = true
  await resolveUser(row.userId)
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
    await clientApi.delete(deleteItem.value.clientId)
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
    await exportCsv('/api/v1/client/list', 'clients.csv', filterParams)
  } catch (err) {
    notifyApiError(err, t)
  }
}

onMounted(fetchData)
</script>
