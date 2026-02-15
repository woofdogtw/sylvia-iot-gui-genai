import { coremgrUrl } from '@sylvia-iot/shared'
import { Notify } from 'quasar'

/**
 * Export CSV from the server using the format=csv query parameter.
 * On supported browsers (Chromium), uses File System Access API for streaming.
 * Falls back to Blob download on other browsers.
 *
 * @param {string} path - API path (e.g. '/data/api/v1/application-uldata/list')
 * @param {string} filename - Suggested filename (e.g. 'application-uldata.csv')
 * @param {object} [params] - Additional query parameters
 */
export async function exportCsv(path, filename, params = {}) {
  const token = localStorage.getItem('access_token') || ''
  const query = new URLSearchParams({ ...params, format: 'csv', limit: '0' })
  const url = `${coremgrUrl(path)}?${query}`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  // Try File System Access API (Chromium)
  if (window.showSaveFilePicker) {
    try {
      await streamToFile(response, filename)
      return
    } catch (err) {
      if (err.name === 'AbortError') return
    }
  }

  // Fallback: Blob download
  await blobDownload(response, filename)
}

async function streamToFile(response, filename) {
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: filename,
    types: [{ description: 'CSV', accept: { 'text/csv': ['.csv'] } }],
  })
  const writable = await fileHandle.createWritable()
  const reader = response.body.getReader()

  let downloaded = 0
  const dismiss = Notify.create({
    group: false,
    spinner: true,
    message: 'Downloading... 0 bytes',
    timeout: 0,
    position: 'bottom',
  })

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      await writable.write(value)
      downloaded += value.byteLength
      dismiss({
        message: `Downloading... ${formatBytes(downloaded)}`,
      })
    }
  } finally {
    await writable.close()
    dismiss()
  }
}

async function blobDownload(response, filename) {
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
