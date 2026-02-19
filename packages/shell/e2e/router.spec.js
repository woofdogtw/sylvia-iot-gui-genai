import { test, expect } from '@playwright/test'
import { login, navigateTo } from './helpers.js'

test.describe('Router Plugin Pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should show Router menu category with 5 items', async ({ page }) => {
    // The drawer is always visible at the default 1280px viewport (show-if-above).
    // Wait for the drawer to be populated with menu items.
    await page.locator('.q-drawer .q-item').first().waitFor({ timeout: 5000 })

    // Find the Router category expansion item
    const routerCategory = page.locator('.q-expansion-item').filter({
      has: page.locator('.q-item__label', { hasText: /^Router$|^路由器$/ }),
    })
    await routerCategory.click()
    await page.waitForTimeout(300)

    // Check all 5 menu items are present (1 header + 5 sub-items = 6 .q-item)
    const menuItems = routerCategory.locator('.q-item')
    await expect(menuItems).toHaveCount(6)
  })

  test('should display Dashboard page with CPU, memory, disk sections', async ({ page }) => {
    await navigateTo(page, '/router/dashboard')
    // Check for the title
    await expect(page.locator('.text-h6')).toContainText(/System Dashboard|系統總覽/)
    // Check for CPU toggle
    await expect(page.locator('.q-btn-toggle')).toBeVisible()
    // Check for 3 cards (CPU, memory, disk)
    const cards = page.locator('.q-card')
    await expect(cards).toHaveCount(3)
  })

  test('should toggle CPU view between per-core and overall', async ({ page }) => {
    await navigateTo(page, '/router/dashboard')
    // The toggle buttons should be visible
    const toggle = page.locator('.q-btn-toggle')
    await expect(toggle).toBeVisible()
    // Default is "Overall"; click "Per-core" to switch
    const perCoreBtn = toggle.locator('.q-btn').filter({ hasText: /Per Core|各核心/ })
    await perCoreBtn.click()
    await page.waitForTimeout(300)
    // Should now show per-core rows (Core 0 / 核心 0)
    const cpuCard = page.locator('.q-card').first()
    await expect(cpuCard.locator('.col-auto', { hasText: /Core 0|核心 0/ }).first()).toBeVisible()
  })

  test('should display WAN page with refresh button', async ({ page }) => {
    await navigateTo(page, '/router/wan')
    await expect(page.locator('.text-h6')).toContainText(/WAN Configuration|WAN 設定/)
    await expect(page.locator('button[title="Refresh"], button[title="重新整理"]')).toBeVisible()
  })

  test('should display LAN page with config form and leases table', async ({ page }) => {
    await navigateTo(page, '/router/lan')
    await expect(page.locator('.text-h6')).toContainText(/LAN Configuration|LAN 設定/)
    // Should have save button
    const saveBtn = page.locator('.q-btn').filter({ hasText: /Save|儲存/ })
    await expect(saveBtn.first()).toBeVisible()
    // Should have leases table
    await expect(page.locator('.q-table')).toBeVisible()
  })

  test('should display WLAN page', async ({ page }) => {
    await navigateTo(page, '/router/wlan')
    await expect(page.locator('.text-h6')).toContainText(/Wireless LAN|無線區域網路/)
  })

  test('should display WWAN page', async ({ page }) => {
    await navigateTo(page, '/router/wwan')
    await expect(page.locator('.text-h6')).toContainText(/Wireless WAN|無線廣域網路/)
  })

  // --- Backend-integrated widget tests (Task 3) ---

  test('should show ServiceInfoWidget in the toolbar', async ({ page }) => {
    // ServiceInfoWidget renders as div.text-center inside the toolbar.
    // It shows two lines: service name and version (version contains digits and dots e.g. "0.4.2")
    const widgets = page.locator('.q-toolbar div.text-center')
    await expect(widgets.filter({ hasText: /\d+\.\d+/ }).first()).toBeVisible({ timeout: 5000 })
  })

  test('should show SystemClockWidget with date in the toolbar', async ({ page }) => {
    // SystemClockWidget renders as div.text-center inside the toolbar.
    // Top line is "YYYY/MM/DD"
    const widgets = page.locator('.q-toolbar div.text-center')
    await expect(widgets.filter({ hasText: /\d{4}\/\d{2}\/\d{2}/ }).first()).toBeVisible({ timeout: 5000 })
  })

  // --- Backend-integrated dashboard test (Task 4) ---

  test('should display Dashboard with real CPU, memory and disk data', async ({ page }) => {
    await navigateTo(page, '/router/dashboard')
    await expect(page.locator('.text-h6')).toContainText(/System Dashboard|系統總覽/)
    // Wait for auto-refresh to populate data from GET /api/v1/sys/usage
    await page.waitForTimeout(2000)
    // Three cards should be present (CPU, memory, disk)
    await expect(page.locator('.q-card')).toHaveCount(3)
    // Memory progress bar should be visible (memory always exists)
    const memCard = page.locator('.q-card').nth(1)
    await expect(memCard.locator('.q-linear-progress')).toBeVisible()
    // Disk progress bar should be visible
    const diskCard = page.locator('.q-card').nth(2)
    await expect(diskCard.locator('.q-linear-progress')).toBeVisible()
  })

  // --- Backend-integrated network page tests (Task 5) ---

  test('should display WAN page content from real backend', async ({ page }) => {
    await navigateTo(page, '/router/wan')
    await expect(page.locator('.text-h6')).toContainText(/WAN Configuration|WAN 設定/)
    // Wait for API response (cards shown or empty state — both are valid)
    await page.waitForTimeout(2000)
    // Should not have an error notification blocking the page
    await expect(page.locator('.q-notification--negative')).toHaveCount(0)
  })

  test('should display LAN page content from real backend', async ({ page }) => {
    await navigateTo(page, '/router/lan')
    await expect(page.locator('.text-h6')).toContainText(/LAN Configuration|LAN 設定/)
    await page.waitForTimeout(2000)
    await expect(page.locator('.q-notification--negative')).toHaveCount(0)
  })
})
