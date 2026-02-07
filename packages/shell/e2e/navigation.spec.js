import { test, expect } from '@playwright/test'

test.describe('Navigation (unauthenticated)', () => {
  test('should show welcome page on root', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Welcome to Sylvia-IoT' })).toBeVisible()
  })

  test('should have a login button on welcome page', async ({ page }) => {
    await page.goto('/')
    const loginBtn = page.getByRole('main').getByRole('button', { name: /login|登入/i })
    await expect(loginBtn).toBeVisible()
  })

  test('should redirect to welcome when accessing protected route', async ({ page }) => {
    await page.goto('/#/home')
    // Route guard should redirect to welcome
    await page.waitForURL('**/#/')
    await expect(page.getByRole('heading', { name: 'Welcome to Sylvia-IoT' })).toBeVisible()
  })

  test('should redirect to welcome when accessing settings', async ({ page }) => {
    await page.goto('/#/settings')
    await page.waitForURL('**/#/')
  })

  test('should show hamburger menu with drawer', async ({ page }) => {
    await page.goto('/')
    // Click hamburger menu button
    const menuBtn = page.locator('button[aria-label="Menu"]')
    await menuBtn.click()
    // Drawer should appear with Home and Settings items
    await expect(page.locator('.q-drawer')).toBeVisible()
  })
})
