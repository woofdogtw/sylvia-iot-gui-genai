<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <div class="text-h1 text-weight-thin q-mb-md" style="font-size: 150px; line-height: 1">
        404
      </div>
      <p class="text-h5 q-mb-lg">{{ t('error.notFound') }}</p>
      <q-btn color="primary" :label="t('error.goHome')" :to="{ name: 'welcome' }" />
    </div>
  </q-page>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
