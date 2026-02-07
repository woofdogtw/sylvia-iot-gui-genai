import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n/index.js'
import { detectBrowserLocale } from 'stores/app-store.js'

const i18n = createI18n({
  locale: localStorage.getItem('locale') || detectBrowserLocale(),
  fallbackLocale: 'en-US',
  messages,
  legacy: false,
})

export default boot(({ app }) => {
  app.use(i18n)
})

export { i18n }
