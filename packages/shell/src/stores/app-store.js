import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Dark } from 'quasar'

export const useAppStore = defineStore('app', () => {
  const locale = ref(localStorage.getItem('locale') || detectBrowserLocale())
  const isDark = ref(detectInitialDark())

  // Apply saved theme on init
  Dark.set(isDark.value)

  // Persist settings when they change
  watch(locale, (val) => {
    localStorage.setItem('locale', val)
  })

  watch(isDark, (val) => {
    localStorage.setItem('isDark', String(val))
    Dark.set(val)
  })

  function setLocale(newLocale) {
    locale.value = newLocale
  }

  function toggleDark() {
    isDark.value = !isDark.value
  }

  function setDark(val) {
    isDark.value = val
  }

  return {
    locale,
    isDark,
    setLocale,
    toggleDark,
    setDark,
  }
})

/**
 * Detect browser locale and map to supported locales.
 */
export function detectBrowserLocale() {
  const browserLang = navigator.language || navigator.userLanguage || 'en-US'
  if (browserLang.startsWith('zh')) {
    return 'zh-TW'
  }
  return 'en-US'
}

/**
 * Detect initial dark mode preference.
 * If localStorage has a saved value, use it.
 * Otherwise, default to dark on mobile devices and light on desktop.
 */
function detectInitialDark() {
  const saved = localStorage.getItem('isDark')
  if (saved !== null) {
    return saved === 'true'
  }
  // Detect mobile: touch-primary devices (phones, tablets)
  return window.matchMedia('(pointer: coarse)').matches
}
