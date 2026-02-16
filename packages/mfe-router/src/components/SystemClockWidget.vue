<template>
  <div v-if="visible" class="text-center q-mx-sm" style="line-height: 1.2; font-size: 0.8rem">
    <div>{{ dateLine }}</div>
    <div>{{ timeLine }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { sysApi } from '../api/index.js'

const visible = ref(false)
const dateLine = ref('')
const timeLine = ref('')
let timer = null

function formatFromMs(ms) {
  const d = new Date(ms)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  dateLine.value = `${yyyy}/${mm}/${dd}`
  timeLine.value = `${hh}:${min}`
}

async function fetchAndSchedule() {
  try {
    const res = await sysApi.getTime()
    const ms = res.data?.data?.time
    if (typeof ms !== 'number') {
      visible.value = false
      return
    }
    formatFromMs(ms)
    visible.value = true

    // Smart sleep: compute ms until next minute boundary
    const now = ms
    const msIntoMinute = now % 60000
    const delay = 60000 - msIntoMinute + 500 // add 500ms buffer
    timer = setTimeout(fetchAndSchedule, delay)
  } catch {
    visible.value = false
  }
}

onMounted(() => {
  fetchAndSchedule()
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>
