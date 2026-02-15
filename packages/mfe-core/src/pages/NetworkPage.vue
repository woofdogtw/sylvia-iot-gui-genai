<template>
  <q-page padding>
    <!-- Toolbar -->
    <div class="row q-mb-md q-gutter-sm items-center">
      <q-select
        v-model="selectedUnit"
        :options="unitOptions"
        :label="t('core.common.selectUnit')"
        dense outlined emit-value map-options
        class="col-auto" style="min-width: 180px"
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
      v-model:pagination="pagination" row-key="networkId"
      :visible-columns="visibleColumns"
      :no-data-label="t('core.common.noData')"
      @request="onRequest"
    >
      <template #body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn flat round dense icon="send" size="sm" :title="t('core.common.sendData')" @click="openSendDialog(props.row)" />
          <q-btn flat round dense icon="bar_chart" size="sm" :title="t('core.common.stats')" @click="openStatsDialog(props.row)" />
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
            <q-input v-model="addForm.code" :label="t('core.network.code')" :rules="[ruleRequired, ruleCode]" dense outlined class="q-mb-sm" />
            <q-select
              v-model="addForm.unitId" :options="addUnitOptions" :label="t('core.network.unitId')"
              :rules="isAdminOrManager ? [] : [ruleRequired]"
              dense outlined emit-value map-options class="q-mb-sm"
            />
            <q-input v-model="addForm.hostUri" :label="t('core.network.hostUri')" :rules="[ruleRequired, ruleHostUri]" dense outlined class="q-mb-sm" />
            <q-input v-model="addForm.name" :label="t('core.network.name')" dense outlined class="q-mb-sm" />
            <q-input v-if="isAmqp(addForm.hostUri)" v-model="addForm.ttl" :label="t('core.network.ttl')" :rules="[ruleNonNeg]" dense outlined class="q-mb-sm" />
            <q-input v-if="isAmqp(addForm.hostUri)" v-model="addForm.length" :label="t('core.network.length')" :rules="[ruleNonNeg]" dense outlined class="q-mb-sm" />
            <q-input v-model="addForm.info" :label="t('core.network.info')" :rules="[ruleJson]" type="textarea" dense outlined autogrow />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('core.common.cancel')" @click="showAdd = false" />
          <q-btn flat color="primary" :label="t('core.common.ok')" @click="submitAdd" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Password Display Dialog -->
    <q-dialog v-model="showPassword" @keyup.escape="showPassword = false">
      <q-card style="min-width: 400px">
        <q-card-section><div class="text-h6">{{ t('core.common.password') }}</div></q-card-section>
        <q-card-section>
          <q-input v-model="passwordValue" :type="passwordVisible ? 'text' : 'password'" readonly outlined dense>
            <template #append>
              <q-icon :name="passwordVisible ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="passwordVisible = !passwordVisible" />
              <q-icon name="content_copy" class="cursor-pointer q-ml-sm" @click="copyPassword" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right"><q-btn flat :label="t('core.common.close')" @click="showPassword = false" /></q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEdit" @keyup.enter="submitEdit" @keyup.escape="showEdit = false">
      <q-card style="min-width: 450px">
        <q-card-section><div class="text-h6">{{ t('core.common.edit') }}</div></q-card-section>
        <q-card-section>
          <q-form ref="editFormRef" greedy>
            <q-input v-model="editForm.hostUri" :label="t('core.network.hostUri')" :rules="[ruleRequired, ruleHostUri]" dense outlined class="q-mb-sm" />
            <q-input v-model="editForm.name" :label="t('core.network.name')" dense outlined class="q-mb-sm" />
            <q-input v-if="isAmqp(editForm.hostUri)" v-model="editForm.ttl" :label="t('core.network.ttl')" :rules="[ruleNonNeg]" dense outlined class="q-mb-sm" />
            <q-input v-if="isAmqp(editForm.hostUri)" v-model="editForm.length" :label="t('core.network.length')" :rules="[ruleNonNeg]" dense outlined class="q-mb-sm" />
            <q-input v-model="editForm.password" :label="t('core.common.password')" :rules="hostUriChanged ? [ruleRequired] : []" type="password" dense outlined class="q-mb-sm" />
            <q-input v-model="editForm.info" :label="t('core.network.info')" :rules="[ruleJson]" type="textarea" dense outlined autogrow />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('core.common.cancel')" @click="showEdit = false" />
          <q-btn flat color="primary" :label="t('core.common.ok')" @click="submitEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Stats Dialog (dldata queue only) -->
    <q-dialog v-model="showStats" @hide="closeStatsDialog">
      <q-card style="min-width: 500px">
        <q-card-section><div class="text-h6">{{ t('core.common.stats') }} - {{ statsItem.code }}</div></q-card-section>
        <q-card-section>
          <q-markup-table dense flat>
            <thead>
              <tr>
                <th>Queue</th>
                <th>{{ t('core.common.consumers') }}</th>
                <th>{{ t('core.common.messages') }}</th>
                <th>{{ t('core.common.publishRate') }}</th>
                <th>{{ t('core.common.deliveryRate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ t('core.network.queueDldata') }}</td>
                <td>{{ statsData.dldata?.consumers ?? '-' }}</td>
                <td>{{ statsData.dldata?.messages ?? '-' }}</td>
                <td>{{ statsData.dldata?.publishRate ?? '-' }}</td>
                <td>{{ statsData.dldata?.deliveryRate ?? '-' }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
        <q-card-actions align="right"><q-btn flat :label="t('core.common.close')" @click="closeStatsDialog" /></q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Send UL Data Dialog -->
    <q-dialog v-model="showSend" @keyup.enter="submitSend" @keyup.escape="showSend = false">
      <q-card style="min-width: 450px">
        <q-card-section><div class="text-h6">{{ t('core.common.sendData') }}</div></q-card-section>
        <q-card-section>
          <q-form ref="sendFormRef" greedy>
            <q-select v-model="sendForm.deviceId" :options="deviceOptions" :label="t('core.network.deviceId')" :rules="[ruleRequired]" dense outlined emit-value map-options class="q-mb-sm" />
            <q-select v-model="sendForm.payloadType" :options="payloadTypeOptions" :label="t('core.common.payloadType')" dense outlined emit-value map-options class="q-mb-sm" />
            <q-input v-model="sendForm.payload" :label="t('core.common.payload')" :rules="sendForm.payloadType === 'hex' ? [ruleHex] : []" dense outlined class="q-mb-sm" />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('core.common.cancel')" @click="showSend = false" />
          <q-btn flat color="primary" :label="t('core.common.send')" @click="submitSend" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Detail Dialog -->
    <q-dialog v-model="showDetail" @keyup.escape="showDetail = false">
      <q-card style="min-width: 450px">
        <q-card-section><div class="text-h6">{{ t('core.common.detail') }}</div></q-card-section>
        <q-card-section>
          <q-list dense>
            <q-item><q-item-section><q-item-label caption>{{ t('core.network.code') }}</q-item-label><q-item-label>{{ detailItem.code }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.network.name') }}</q-item-label><q-item-label>{{ detailItem.name || '-' }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.network.unitId') }}</q-item-label><q-item-label>{{ detailItem.unitId || t('core.network.publicNetwork') }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.network.hostUri') }}</q-item-label><q-item-label>{{ detailItem.hostUri }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.network.protocol') }}</q-item-label><q-item-label>{{ extractProtocol(detailItem.hostUri) }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>{{ t('core.network.info') }}</q-item-label><q-item-label style="white-space: pre-wrap">{{ formatJson(detailItem.info) }}</q-item-label></q-item-section></q-item>
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
        <q-card-section>{{ t('core.common.deleteConfirm', { name: deleteItem.code }) }}</q-card-section>
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
import { networkApi, unitApi, deviceApi } from '../api/index.js'
import {
  validateCode, validateHostUri, validateNonNegativeInt, validateJsonObject, validateHexPayload,
  parseJsonInfo, trimValue, textToHex,
} from '../utils/validate.js'
import { exportCsv } from '../utils/csv.js'
import { notifyApiError, notifySuccess } from '../utils/notify.js'
import { formatTime } from '../utils/format.js'

const { t } = useI18n()
const $q = useQuasar()
const { isAdmin, isAdminOrManager } = useRoles()

// ── Unit selector ──
const selectedUnit = ref(null)
const unitOptions = ref([])
const unitListOptions = ref([])

async function loadUnits() {
  try {
    const res = await unitApi.list({ limit: 0 })
    const units = res.data?.data || []
    unitListOptions.value = units.map((u) => ({ label: u.code, value: u.unitId }))
    if (isAdminOrManager.value) {
      unitOptions.value = [
        { label: t('core.common.allUnits'), value: null },
        ...unitListOptions.value,
      ]
    } else {
      unitOptions.value = [...unitListOptions.value]
      if (unitListOptions.value.length) {
        selectedUnit.value = unitListOptions.value[0].value
        filterParams.unit = selectedUnit.value
      }
    }
  } catch { /* ignore */ }
}

// Add dialog: admin/manager can leave unit empty (public network)
const addUnitOptions = computed(() => {
  if (isAdminOrManager.value) {
    return [{ label: t('core.network.publicNetwork'), value: '' }, ...unitListOptions.value]
  }
  return unitListOptions.value
})

function onUnitChange() {
  filterParams.unit = selectedUnit.value || undefined
  refresh()
}

// ── Table ──
const columns = computed(() => [
  { name: 'code', label: t('core.network.code'), field: 'code', align: 'left', sortable: true },
  { name: 'name', label: t('core.network.name'), field: 'name', align: 'left', sortable: true },
  { name: 'unitId', label: t('core.network.unitId'), field: 'unitDisplay', align: 'left' },
  { name: 'protocol', label: t('core.network.protocol'), field: 'protocol', align: 'left' },
  { name: 'createdAt', label: t('core.common.created'), field: 'createdAtStr', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
])

const visibleColumns = computed(() => {
  const cols = ['code', 'name', 'actions']
  if ($q.screen.gt.sm) cols.push('unitId', 'protocol', 'createdAt')
  return cols
})

const {
  rows, loading, pagination, filterParams, fetchData, onRequest, refresh,
} = useListPage({
  apiList: networkApi.list,
  apiCount: networkApi.count,
  mapRow: (row) => ({
    ...row,
    unitDisplay: row.unitId ? (row.unitCode || row.unitId) : t('core.network.publicNetwork'),
    protocol: extractProtocol(row.hostUri),
    createdAtStr: formatTime(row.createdAt),
  }),
})

function extractProtocol(uri) {
  if (!uri) return '-'
  if (uri.startsWith('amqps://')) return 'AMQPS'
  if (uri.startsWith('amqp://')) return 'AMQP'
  if (uri.startsWith('mqtts://')) return 'MQTTS'
  if (uri.startsWith('mqtt://')) return 'MQTT'
  return '-'
}
function isAmqp(uri) { return uri && (uri.startsWith('amqp://') || uri.startsWith('amqps://')) }
function formatJson(val) {
  if (!val || (typeof val === 'object' && Object.keys(val).length === 0)) return '{}'
  return typeof val === 'string' ? val : JSON.stringify(val, null, 2)
}

function ruleRequired(val) { return !!val || t('core.validate.required') }
function ruleCode(val) { const r = validateCode(val); return r === true ? true : t(r) }
function ruleHostUri(val) { const r = validateHostUri(val); return r === true ? true : t(r) }
function ruleNonNeg(val) { const r = validateNonNegativeInt(val); return r === true ? true : t(r) }
function ruleJson(val) { const r = validateJsonObject(val); return r === true ? true : t(r) }
function ruleHex(val) { const r = validateHexPayload(val); return r === true ? true : t(r) }

// ── Add ──
const showAdd = ref(false)
const addFormRef = ref(null)
const addForm = ref({ code: '', unitId: '', hostUri: '', name: '', ttl: '', length: '', info: '' })

function openAddDialog() {
  addForm.value = { code: '', unitId: selectedUnit.value || '', hostUri: '', name: '', ttl: '', length: '', info: '' }
  showAdd.value = true
}

async function submitAdd() {
  const valid = await addFormRef.value?.validate()
  if (!valid) return
  try {
    const data = {
      code: trimValue(addForm.value.code).toLowerCase(),
      hostUri: trimValue(addForm.value.hostUri),
    }
    if (addForm.value.unitId) data.unitId = addForm.value.unitId
    const name = trimValue(addForm.value.name)
    if (name) data.name = name
    if (isAmqp(data.hostUri)) {
      if (addForm.value.ttl !== '') data.ttl = Number(addForm.value.ttl)
      if (addForm.value.length !== '') data.length = Number(addForm.value.length)
    }
    data.info = parseJsonInfo(addForm.value.info)
    const res = await networkApi.create(data)
    showAdd.value = false
    if (res.data?.data?.password) {
      passwordValue.value = res.data.data.password
      passwordVisible.value = false
      showPassword.value = true
    }
    notifySuccess(t('core.common.createSuccess'))
    refresh()
  } catch (err) { notifyApiError(err, t) }
}

// ── Password Display ──
const showPassword = ref(false)
const passwordValue = ref('')
const passwordVisible = ref(false)
function copyPassword() { copyToClipboard(passwordValue.value); notifySuccess(t('core.common.copied')) }

// ── Edit ──
const showEdit = ref(false)
const editFormRef = ref(null)
const editForm = ref({ hostUri: '', name: '', ttl: '', length: '', password: '', info: '' })
const editingNet = ref(null)

const hostUriChanged = computed(() => editingNet.value && editForm.value.hostUri !== editingNet.value.hostUri)

function openEditDialog(row) {
  editingNet.value = row
  editForm.value = {
    hostUri: row.hostUri || '', name: row.name || '',
    ttl: row.ttl != null ? String(row.ttl) : '',
    length: row.length != null ? String(row.length) : '',
    password: '',
    info: row.info ? JSON.stringify(row.info, null, 2) : '',
  }
  showEdit.value = true
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate()
  if (!valid) return
  try {
    const data = { hostUri: trimValue(editForm.value.hostUri), name: trimValue(editForm.value.name) }
    if (isAmqp(data.hostUri)) {
      if (editForm.value.ttl !== '') data.ttl = Number(editForm.value.ttl)
      if (editForm.value.length !== '') data.length = Number(editForm.value.length)
    }
    const pw = editForm.value.password
    if (pw) data.password = pw
    data.info = parseJsonInfo(editForm.value.info)
    await networkApi.update(editingNet.value.networkId, data)
    notifySuccess(t('core.common.updateSuccess'))
    showEdit.value = false
    refresh()
  } catch (err) { notifyApiError(err, t) }
}

// ── Stats (dldata queue only) ──
const showStats = ref(false)
const statsItem = ref({})
const statsData = ref({})
let statsTimer = null

function openStatsDialog(row) {
  statsItem.value = row; statsData.value = {}; showStats.value = true
  fetchStats(); statsTimer = setInterval(fetchStats, 1000)
}
function closeStatsDialog() {
  showStats.value = false
  if (statsTimer) { clearInterval(statsTimer); statsTimer = null }
}
async function fetchStats() {
  try { const res = await networkApi.stats(statsItem.value.networkId); statsData.value = res.data?.data || {} }
  catch { /* ignore */ }
}

// ── Send UL Data ──
const showSend = ref(false)
const sendFormRef = ref(null)
const sendForm = ref({ deviceId: '', payload: '', payloadType: 'hex' })
const deviceOptions = ref([])
const payloadTypeOptions = computed(() => [
  { label: t('core.common.hex'), value: 'hex' },
  { label: t('core.common.text'), value: 'text' },
])

async function openSendDialog(row) {
  sendForm.value = { deviceId: '', payload: '', payloadType: 'hex' }
  showSend.value = true
  try {
    const params = { limit: 0 }
    if (row.unitId) params.unit = row.unitId
    const res = await deviceApi.list(params)
    deviceOptions.value = (res.data?.data || []).map((d) => ({ label: d.networkAddr, value: d.deviceId }))
  } catch { deviceOptions.value = [] }
  sendForm.value._networkId = row.networkId
}

async function submitSend() {
  const valid = await sendFormRef.value?.validate()
  if (!valid) return
  try {
    let payload = sendForm.value.payload
    if (sendForm.value.payloadType === 'text') payload = textToHex(payload)
    await networkApi.sendUlData(sendForm.value._networkId, { deviceId: sendForm.value.deviceId, payload })
    notifySuccess(t('core.common.sendData'))
    showSend.value = false
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
  try { await networkApi.delete(deleteItem.value.networkId); notifySuccess(t('core.common.deleteSuccess')); showDelete.value = false; refresh() }
  catch (err) { notifyApiError(err, t) }
}

async function onExportCsv() {
  try { await exportCsv('/api/v1/network/list', 'networks.csv', filterParams) }
  catch (err) { notifyApiError(err, t) }
}

onMounted(async () => { await loadUnits(); fetchData() })
</script>
