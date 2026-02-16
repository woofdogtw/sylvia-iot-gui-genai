<template>
  <div v-if="visible" class="text-center q-mx-sm" style="line-height: 1.2; font-size: 0.8rem">
    <div>{{ serviceName }}</div>
    <div>{{ serviceVersion }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { versionApi } from '../api/index.js'

const visible = ref(false)
const serviceName = ref('')
const serviceVersion = ref('')

onMounted(async () => {
  try {
    const res = await versionApi.get()
    const data = res.data?.data
    if (data?.name && data?.version) {
      serviceName.value = data.name
      serviceVersion.value = data.version
      visible.value = true
    }
  } catch {
    visible.value = false
  }
})
</script>
