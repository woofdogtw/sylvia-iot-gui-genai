import { Notify } from 'quasar'

/**
 * Show an API error notification with localized message.
 * @param {object} error - Axios error object
 * @param {Function} t - i18n translate function
 */
export function notifyApiError(error, t) {
  const status = error.response?.status
  const code = error.response?.data?.code

  let message
  if (code) {
    const key = `apiError.${code}`
    const translated = t(key)
    message = translated !== key ? translated : code
  } else if (status) {
    message = `HTTP ${status}: ${error.response?.statusText || ''}`
  } else {
    message = error.message || 'Unknown error'
  }

  Notify.create({
    type: 'negative',
    message,
    position: 'top',
    timeout: 5000,
  })
}

/**
 * Show a success notification.
 * @param {string} message - Message to display
 */
export function notifySuccess(message) {
  Notify.create({
    type: 'positive',
    message,
    position: 'top',
    timeout: 3000,
  })
}
