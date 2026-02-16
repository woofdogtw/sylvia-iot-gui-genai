<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('router.wlan.title') }}</div>
      <q-space />
      <q-btn v-if="supported" flat round icon="refresh" :title="t('router.common.refresh')" @click="fetchConfig" />
    </div>

    <q-banner v-if="!supported && !loading" class="bg-warning text-white">
      {{ t('router.common.notSupported') }}
    </q-banner>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner size="40px" />
    </div>

    <q-card v-if="supported && !loading">
      <q-card-section>
        <q-toggle v-model="form.enable" :label="form.enable ? t('router.common.enabled') : t('router.common.disabled')" class="q-mb-sm" />
        <template v-if="form.enable">
          <q-input v-model="form.ssid" :label="t('router.wlan.ssid')" dense outlined class="q-mb-sm" />
          <q-select
            v-model="form.channel"
            :label="t('router.wlan.channel')"
            :options="channelOptions"
            dense
            outlined
            class="q-mb-sm"
          />
          <q-input v-model="form.password" :label="t('router.wlan.password')" type="password" dense outlined class="q-mb-sm" />
        </template>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" :label="t('router.common.save')" @click="submitConfig" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { wlanApi } from '../api/index.js'
import { notifyApiError, notifySuccess } from '../utils/notify.js'

const { t } = useI18n()

const loading = ref(true)
const supported = ref(true)
const channelOptions = Array.from({ length: 11 }, (_, i) => i + 1)
const form = ref({
  enable: false,
  ssid: '',
  channel: 1,
  password: '',
})

async function fetchConfig() {
  loading.value = true
  try {
    const res = await wlanApi.get()
    const data = res.data?.data
    if (!data) {
      supported.value = false
      return
    }
    const conf = data.conf || {}
    form.value = {
      enable: !!data.enable,
      ssid: conf.ssid || '',
      channel: conf.channel || 1,
      password: conf.password || '',
    }
    supported.value = true
  } catch (err) {
    if (err.response?.status === 404) {
      supported.value = false
    } else {
      notifyApiError(err, t)
    }
  } finally {
    loading.value = false
  }
}

async function submitConfig() {
  try {
    const body = { enable: form.value.enable }
    if (form.value.enable) {
      body.conf = {
        ssid: form.value.ssid,
        channel: form.value.channel,
        password: form.value.password,
      }
    }
    await wlanApi.update(body)
    notifySuccess(t('router.common.saveSuccess'))
  } catch (err) {
    notifyApiError(err, t)
  }
}

onMounted(fetchConfig)
</script>
