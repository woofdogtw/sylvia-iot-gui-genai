<template>
  <q-page padding>
    <div class="text-h6 q-mb-md">{{ t('router.dashboard.title') }}</div>

    <!-- CPU Section -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-mb-sm">
          <div class="text-subtitle1">{{ t('router.dashboard.cpu') }}</div>
          <q-space />
          <q-btn-toggle
            v-model="cpuMode"
            :options="[
              { label: t('router.dashboard.cpuPerCore'), value: 'perCore' },
              { label: t('router.dashboard.cpuOverall'), value: 'overall' },
            ]"
            dense
            no-caps
            toggle-color="primary"
            size="sm"
          />
        </div>

        <template v-if="cpuMode === 'perCore'">
          <div v-for="(pct, idx) in cpuCores" :key="idx" class="row items-center q-mb-xs">
            <div class="col-auto" style="min-width: 60px">{{ t('router.dashboard.core') }} {{ idx }}</div>
            <q-linear-progress :value="pct / 100" color="primary" class="col q-mx-sm" style="height: 16px" />
            <div class="col-auto" style="min-width: 40px; text-align: right">{{ pct }}%</div>
          </div>
        </template>
        <template v-else>
          <div class="row items-center q-mb-xs">
            <div class="col-auto" style="min-width: 60px">CPU</div>
            <q-linear-progress :value="cpuOverall / 100" color="primary" class="col q-mx-sm" style="height: 16px" />
            <div class="col-auto" style="min-width: 40px; text-align: right">{{ cpuOverall }}%</div>
          </div>
        </template>
      </q-card-section>
    </q-card>

    <!-- Memory Section -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">{{ t('router.dashboard.memory') }}</div>
        <q-linear-progress :value="memoryRatio" color="green" style="height: 20px" />
        <div class="text-caption q-mt-xs">
          {{ t('router.dashboard.used') }}: {{ formatBytes(memoryUsed) }} / {{ t('router.dashboard.total') }}: {{ formatBytes(memoryTotal) }}
          ({{ memoryPct }}%)
        </div>
      </q-card-section>
    </q-card>

    <!-- Disk Section -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">{{ t('router.dashboard.disk') }}</div>
        <q-linear-progress :value="diskRatio" color="orange" style="height: 20px" />
        <div class="text-caption q-mt-xs">
          {{ t('router.dashboard.used') }}: {{ formatBytes(diskUsed) }} / {{ t('router.dashboard.total') }}: {{ formatBytes(diskTotal) }}
          ({{ diskPct }}%)
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { sysApi } from '../api/index.js'

const { t } = useI18n()

const cpuMode = ref('perCore')
const cpuCores = ref([])
const memoryUsed = ref(0)
const memoryTotal = ref(1)
const diskUsed = ref(0)
const diskTotal = ref(1)
let timer = null

const cpuOverall = computed(() => {
  if (!cpuCores.value.length) return 0
  const sum = cpuCores.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / cpuCores.value.length)
})

const memoryRatio = computed(() => memoryTotal.value ? memoryUsed.value / memoryTotal.value : 0)
const memoryPct = computed(() => Math.round(memoryRatio.value * 100))
const diskRatio = computed(() => diskTotal.value ? diskUsed.value / diskTotal.value : 0)
const diskPct = computed(() => Math.round(diskRatio.value * 100))

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const val = (bytes / Math.pow(1024, i)).toFixed(1)
  return `${val} ${units[i]}`
}

async function fetchUsage() {
  try {
    const res = await sysApi.getUsage()
    const data = res.data?.data
    if (!data) return
    cpuCores.value = Array.isArray(data.cpu) ? data.cpu : []
    memoryUsed.value = data.mem?.used || 0
    memoryTotal.value = data.mem?.total || 1
    diskUsed.value = data.disk?.used || 0
    diskTotal.value = data.disk?.total || 1
  } catch {
    // silently ignore
  }
}

onMounted(() => {
  fetchUsage()
  timer = setInterval(fetchUsage, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
