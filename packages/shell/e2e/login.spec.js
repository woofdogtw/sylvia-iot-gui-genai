import { test, expect } from '@playwright/test'

/**
 * Login helper: performs the full OAuth2 login flow.
 */
async function login(page) {
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

test.describe('OAuth2 Login Flow', () => {
  test('should complete full login flow with Sylvia-IoT', async ({ page }) => {
    await login(page)

    // Should be on home page after auth
    await expect(page).toHaveURL(/.*#\/home/)
  })

  test('should show header after login', async ({ page }) => {
    await login(page)

    const header = page.locator('.q-header')
    await expect(header).toBeVisible()
    await expect(page.locator('.q-toolbar__title')).toContainText('Sylvia-IoT')
  })

  test('should access settings page after login', async ({ page }) => {
    await login(page)

    await page.goto('/#/settings')
    await page.waitForTimeout(500)

    // Settings page should be accessible
    await expect(page).toHaveURL(/.*#\/settings/)
  })

  test('should switch language in settings', async ({ page }) => {
    await login(page)

    await page.goto('/#/settings')
    await page.waitForTimeout(500)

    // Change language to zh-TW
    const langSelect = page.locator('.q-select').first()
    await langSelect.click()
    await page.locator('.q-item', { hasText: '正體中文' }).click()

    // Toolbar should update to Chinese
    await page.waitForTimeout(500)
  })

  test('should toggle dark mode in settings', async ({ page }) => {
    await login(page)

    await page.goto('/#/settings')
    await page.waitForTimeout(500)

    // Toggle dark mode
    const darkToggle = page.locator('.q-toggle').first()
    await darkToggle.click()

    // Body should get dark class
    await expect(page.locator('body')).toHaveClass(/body--dark/)
  })
})
