<template>
  <q-page padding>
    <div class="q-mb-lg text-h5">{{ t('about.title') }}</div>

    <!-- Frontend -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ t('about.frontend') }}</div>
        <q-list dense>
          <q-item>
            <q-item-section>
              <q-item-label overline>{{ t('about.name') }}</q-item-label>
              <q-item-label>{{ appName }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label overline>{{ t('about.version') }}</q-item-label>
              <q-item-label>{{ appVersion }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Core service -->
    <q-card v-if="serviceName" flat bordered>
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ t('about.service') }}</div>
        <q-list dense>
          <q-item>
            <q-item-section>
              <q-item-label overline>{{ t('about.name') }}</q-item-label>
              <q-item-label>{{ serviceName }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label overline>{{ t('about.version') }}</q-item-label>
              <q-item-label>{{ serviceVersion }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@sylvia-iot/shared'

const { t } = useI18n()

const appName = process.env.VITE_APP_NAME
const appVersion = process.env.VITE_APP_VERSION

const serviceName = ref('')
const serviceVersion = ref('')

onMounted(async () => {
  const baseUrl = window.config?.coremgr?.baseUrl || ''
  try {
    const origin = new URL(baseUrl).origin
    const res = await api.get(`${origin}/version`)
    const data = res.data?.data
    if (data?.name && data?.version) {
      serviceName.value = data.name
      serviceVersion.value = data.version
    }
  } catch {
    // fail silently — service section remains hidden
  }
})
</script>
