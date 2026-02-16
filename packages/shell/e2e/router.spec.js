import { test, expect } from '@playwright/test'
import { login, navigateTo } from './helpers.js'

test.describe('Router Plugin Pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should show Router menu category with 5 items', async ({ page }) => {
    // Open the hamburger menu
    const menuBtn = page.locator('.q-toolbar .q-btn .q-icon:has-text("menu")')
    await menuBtn.click()
    await page.waitForTimeout(500)

    // Find the Router category
    const routerCategory = page.locator('.q-expansion-item').filter({
      has: page.locator('.q-item__label', { hasText: /^Router$|^路由器$/ }),
    })
    await routerCategory.click()
    await page.waitForTimeout(300)

    // Check all 5 menu items are present
    const menuItems = routerCategory.locator('.q-item')
    await expect(menuItems).toHaveCount(6) // 1 header + 5 items
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
    // Click "Overall" button
    const overallBtn = toggle.locator('.q-btn').filter({ hasText: /Overall|整體/ })
    await overallBtn.click()
    await page.waitForTimeout(300)
    // Should show single CPU bar label
    await expect(page.locator('text=CPU')).toBeVisible()
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
})
