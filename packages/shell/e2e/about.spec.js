import { test, expect } from '@playwright/test'
import { login } from './helpers.js'

test.describe('About Page (unauthenticated)', () => {
  test('should redirect unauthenticated user away from About page', async ({ page }) => {
    await page.goto('/#/about')
    await page.waitForURL('**/#/', { timeout: 5000 })
    await expect(page.getByRole('heading', { name: 'Welcome to Sylvia-IoT' })).toBeVisible()
  })
})

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should show About item in hamburger menu', async ({ page }) => {
    // The drawer is always visible at the default 1280px viewport (show-if-above).
    await page.locator('.q-drawer .q-item').first().waitFor({ timeout: 5000 })

    // q-icon adds its text ("info") before the label, so use partial match
    const aboutItem = page.locator('.q-drawer .q-item').filter({ hasText: /About|關於/ })
    await expect(aboutItem.first()).toBeVisible()
  })

  test('should navigate to About page from menu', async ({ page }) => {
    await page.locator('.q-drawer .q-item').first().waitFor({ timeout: 5000 })

    const aboutItem = page.locator('.q-drawer .q-item').filter({ hasText: /About|關於/ }).first()
    await aboutItem.click()
    await page.waitForTimeout(500)

    await expect(page).toHaveURL(/.*#\/about/)
  })

  test('should display frontend name and version', async ({ page }) => {
    await page.goto('/#/about')
    await page.waitForTimeout(1000)

    // Frontend section shows app name and version injected at build time via process.env
    const frontendCard = page.locator('.q-card').first()
    await expect(frontendCard).toContainText('Sylvia-IoT')
    await expect(frontendCard).toContainText('0.1.0')
  })

  test('should display core service name and version', async ({ page }) => {
    await page.goto('/#/about')
    await page.waitForTimeout(2000)

    // Service section appears after the /version fetch resolves
    const serviceCard = page.locator('.q-card').nth(1)
    await expect(serviceCard).toBeVisible()
    await expect(serviceCard).toContainText(/sylvia-iot/)
  })
})
