import { Dialog, Notify } from 'quasar'

/**
 * Show an API error in a modal dialog with localized title and raw message body.
 * @param {object} error - Axios error object
 * @param {Function} t - i18n translate function
 */
export function showApiError(error, t) {
  const code = error.response?.data?.code
  const status = error.response?.status

  let title
  if (code) {
    const key = `apiError.${code}`
    const translated = t(key)
    title = translated !== key ? translated : code
  } else {
    title = t('apiError.err_unknown')
  }

  let message
  if (error.response?.data?.message) {
    message = error.response.data.message
  } else if (status) {
    message = `HTTP ${status}: ${error.response?.statusText || ''}`
  } else {
    message = error.message || 'Unknown error'
  }

  Dialog.create({
    title,
    message,
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
