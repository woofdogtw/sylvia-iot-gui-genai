import { test, expect } from '@playwright/test'
import { login, navigateTo, waitForTableLoad } from './helpers.js'

test.describe('Data Plugin Pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display Application Uplink Data page with table', async ({ page }) => {
    await navigateTo(page, '/data/application-ul')
    await waitForTableLoad(page)
    await expect(page.locator('.q-table')).toBeVisible()
    // Read-only: no add button
    const addBtn = page.locator('button[title="Add"], button[title="新增"]')
    await expect(addBtn).toHaveCount(0)
    // Has refresh and export buttons
    await expect(page.locator('button[title="Refresh"], button[title="重新整理"]')).toBeVisible()
    await expect(page.locator('button[title="Export CSV"], button[title="匯出 CSV"]')).toBeVisible()
  })

  test('should display Application Downlink Data page with table', async ({ page }) => {
    await navigateTo(page, '/data/application-dl')
    await waitForTableLoad(page)
    await expect(page.locator('.q-table')).toBeVisible()
  })

  test('should display Network Uplink Data page with table', async ({ page }) => {
    await navigateTo(page, '/data/network-ul')
    await waitForTableLoad(page)
    await expect(page.locator('.q-table')).toBeVisible()
  })

  test('should display Network Downlink Data page with table', async ({ page }) => {
    await navigateTo(page, '/data/network-dl')
    await waitForTableLoad(page)
    await expect(page.locator('.q-table')).toBeVisible()
  })

  test('should display Operation Data page with table', async ({ page }) => {
    await navigateTo(page, '/data/operation')
    await waitForTableLoad(page)
    await expect(page.locator('.q-table')).toBeVisible()
    // Has time range inputs
    await expect(page.locator('input[type="datetime-local"]').first()).toBeVisible()
  })

  test('should show unit filter on application uplink page', async ({ page }) => {
    await navigateTo(page, '/data/application-ul')
    await waitForTableLoad(page)
    await expect(page.locator('.q-select').first()).toBeVisible()
  })

  test('should show hex/text toggle on application uplink page', async ({ page }) => {
    await navigateTo(page, '/data/application-ul')
    await waitForTableLoad(page)
    await expect(page.locator('.q-btn-toggle')).toBeVisible()
  })

  test('should show user filter on operation page for admin', async ({ page }) => {
    await navigateTo(page, '/data/operation')
    await waitForTableLoad(page)
    // Admin should see the user filter input
    const userFilter = page.locator('.q-field').filter({ hasText: /Filter User|篩選使用者/i })
    await expect(userFilter).toBeVisible()
  })

  test('should open detail dialog on application uplink page', async ({ page }) => {
    await navigateTo(page, '/data/application-ul')
    await waitForTableLoad(page)
    const rows = page.locator('.q-table tbody tr')
    if (await rows.count() > 0) {
      await rows.first().locator('button .q-icon:has-text("info")').click()
      await page.waitForTimeout(500)
      await expect(page.locator('.q-dialog')).toBeVisible()
    }
  })

  test('should show data menu items in hamburger menu', async ({ page }) => {
    // Open hamburger menu - find the Data category expansion item by its header label
    await page.locator('.q-drawer .q-item').first().waitFor({ timeout: 5000 })
    // Use the expansion item header (.q-item__label) to match exactly "Data" or "資料"
    const dataCategory = page.locator('.q-expansion-item').filter({
      has: page.locator('.q-item__label', { hasText: /^Data$|^資料$/ }),
    })
    if (await dataCategory.count() > 0) {
      await dataCategory.click()
      await page.waitForTimeout(500)
      await expect(page.locator('.q-item').filter({ hasText: /Application Uplink|應用程式上行/i })).toBeVisible()
      await expect(page.locator('.q-item').filter({ hasText: /Operation|操作紀錄/i })).toBeVisible()
    }
  })
})
