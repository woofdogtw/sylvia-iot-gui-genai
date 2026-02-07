<template>
  <q-page class="flex flex-center">
    <div class="text-center q-pa-lg" style="max-width: 600px">
      <q-icon name="hub" size="80px" color="primary" class="q-mb-md" />
      <h3 class="q-mb-sm">{{ t('welcome.title') }}</h3>
      <p class="text-subtitle1 text-grey q-mb-lg">
        {{ t('welcome.description') }}
      </p>
      <q-btn
        v-if="!authStore.isAuthenticated"
        color="primary"
        size="lg"
        :label="t('auth.login')"
        icon="login"
        @click="authStore.login()"
      />
      <q-btn
        v-else
        color="primary"
        size="lg"
        :label="t('welcome.getStarted')"
        icon="arrow_forward"
        :to="{ name: 'home' }"
      />
    </div>
  </q-page>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'stores/auth-store.js'

const { t } = useI18n()
const authStore = useAuthStore()
</script>
