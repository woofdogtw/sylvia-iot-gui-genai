<template>
  <q-page class="q-pa-lg">
    <h4 class="q-mb-md">{{ t('home.title') }}</h4>
    <p v-if="authStore.user" class="text-subtitle1">
      {{ t('home.welcome', { name: authStore.user.name || authStore.user.account }) }}
    </p>
  </q-page>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'stores/auth-store.js'

const { t } = useI18n()
const authStore = useAuthStore()
</script>
