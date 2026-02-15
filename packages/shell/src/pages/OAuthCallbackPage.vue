<template>
  <q-page class="flex flex-center">
    <div v-if="error" class="text-center">
      <q-icon name="error" size="48px" color="negative" />
      <p class="q-mt-md text-negative">{{ error }}</p>
      <q-btn flat color="primary" :label="t('error.goHome')" :to="{ name: 'welcome' }" />
    </div>
    <div v-else class="text-center">
      <q-spinner size="48px" color="primary" />
      <p class="q-mt-md">Authenticating...</p>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'stores/auth-store.js'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const error = ref(null)

onMounted(async () => {
  // In hash routing mode, the OAuth2 server appends ?code=...&state=... before the #,
  // so params are in window.location.search, not in route.query.
  const urlParams = new URLSearchParams(window.location.search)
  const code = route.query.code || urlParams.get('code')
  const state = route.query.state || urlParams.get('state')

  if (!code) {
    error.value = 'No authorization code received'
    return
  }

  try {
    await authStore.handleCallback(code, state)
    // Remove OAuth2 query parameters (?code=...&state=...) that sit before the hash
    window.history.replaceState(null, '', window.location.pathname + window.location.hash)
    router.replace({ name: 'home' })
  } catch (err) {
    error.value = err.message || 'Authentication failed'
  }
})
</script>
