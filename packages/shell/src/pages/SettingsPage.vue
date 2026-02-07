<template>
  <q-page class="q-pa-lg">
    <h4 class="q-mb-lg">{{ t('settings.title') }}</h4>

    <q-list bordered separator class="rounded-borders" style="max-width: 500px">
      <!-- Language -->
      <q-item>
        <q-item-section>
          <q-item-label>{{ t('settings.language') }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-select
            v-model="currentLocale"
            :options="languageOptions"
            emit-value
            map-options
            dense
            outlined
            style="min-width: 180px"
            @update:model-value="onLocaleChange"
          />
        </q-item-section>
      </q-item>

      <!-- Dark Mode -->
      <q-item>
        <q-item-section>
          <q-item-label>{{ t('settings.darkMode') }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            v-model="darkMode"
            @update:model-value="onDarkModeChange"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from 'stores/app-store.js'

const { t, locale: i18nLocale } = useI18n()
const appStore = useAppStore()

const languageOptions = [
  { label: 'English', value: 'en-US' },
  { label: '正體中文', value: 'zh-TW' },
]

const currentLocale = ref(appStore.locale)
const darkMode = ref(appStore.isDark)

function onLocaleChange(val) {
  appStore.setLocale(val)
  i18nLocale.value = val
}

function onDarkModeChange(val) {
  appStore.setDark(val)
}
</script>
