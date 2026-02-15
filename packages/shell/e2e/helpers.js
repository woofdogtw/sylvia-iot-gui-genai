/**
 * Shared E2E test helpers for Sylvia-IoT GUI.
 */

/**
 * Login helper: performs the full OAuth2 login flow and waits for the app to be ready.
 */
export async function login(page) {
  await page.goto('/')

  // Click the Login button in the main content area
  const loginBtn = page.getByRole('main').getByRole('button', { name: /login|登入/i })
  await loginBtn.click()

  // Wait for Sylvia-IoT login page
  await page.waitForURL('**/auth/oauth2/login**', { timeout: 10000 })

  // Fill credentials and submit
  await page.fill('input[name="account"]', 'admin')
  await page.fill('input[name="password"]', 'admin')
  await page.click('button[type="submit"]')

  // Accept the OAuth2 grant/consent screen
  await page.waitForSelector('button:has-text("Accept")', { timeout: 10000 })
  await page.click('button:has-text("Accept")')

  // Wait for redirect back to our app
  await page.waitForURL('**/localhost:9000/**', { timeout: 10000 })

  // Wait for token exchange and navigation to complete
  await page.waitForTimeout(3000)
}

/**
 * Navigate to a core management page (hash routing).
 */
export async function navigateTo(page, path) {
  await page.goto(`/#${path}`)
  await page.waitForTimeout(1500)
}

/**
 * Wait for the QTable to finish loading (spinner disappears).
 */
export async function waitForTableLoad(page) {
  // Wait for loading spinner to disappear if it appears
  await page.waitForTimeout(1000)
  // Wait for table rows or no-data label to appear
  await page.waitForSelector('.q-table tbody tr, .q-table__bottom', { timeout: 10000 })
}

/**
 * Click the add button in the toolbar.
 */
export async function clickAddButton(page) {
  await page.click('button[title="Add"], button[title="新增"]')
  await page.waitForTimeout(500)
}

/**
 * Click the refresh button in the toolbar.
 */
export async function clickRefreshButton(page) {
  await page.click('button[title="Refresh"], button[title="重新整理"]')
  await page.waitForTimeout(1000)
}

/**
 * Fill a QInput field by its label text.
 */
export async function fillInput(page, label, value) {
  const input = page.locator(`.q-field`).filter({ hasText: label }).locator('input, textarea')
  await input.fill(value)
}

/**
 * Click OK/submit button in a dialog.
 */
export async function clickDialogOk(page) {
  await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /^OK$|^確定$/i }).click()
  await page.waitForTimeout(1500)
}

/**
 * Click Cancel button in a dialog.
 */
export async function clickDialogCancel(page) {
  await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Cancel|取消/i }).click()
  await page.waitForTimeout(500)
}

/**
 * Click Close button in a dialog.
 */
export async function clickDialogClose(page) {
  await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Close|關閉/i }).click()
  await page.waitForTimeout(500)
}

/**
 * Click the Delete confirm button in a dialog.
 */
export async function clickDialogDelete(page) {
  await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Delete|刪除/i }).click()
  await page.waitForTimeout(1500)
}

/**
 * Get the count of data rows in the QTable.
 */
export async function getTableRowCount(page) {
  return page.locator('.q-table tbody tr').count()
}

/**
 * Click an action button (info/edit/delete) on a specific table row.
 * @param {number} rowIndex - 0-based row index
 * @param {string} icon - Material icon name (info, edit, delete)
 */
export async function clickRowAction(page, rowIndex, icon) {
  const row = page.locator('.q-table tbody tr').nth(rowIndex)
  await row.locator(`button .q-icon:has-text("${icon}")`).click()
  await page.waitForTimeout(500)
}
