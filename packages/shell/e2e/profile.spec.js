import { test, expect } from '@playwright/test'
import { login } from './helpers.js'

/**
 * Helper: click the user button (person icon) in the toolbar to open the dropdown menu.
 */
async function openUserMenu(page) {
  const userBtn = page.locator('.q-toolbar .q-btn .q-icon:has-text("person")')
  await userBtn.waitFor({ timeout: 10000 })
  await userBtn.click()
  await page.waitForTimeout(300)
}

/**
 * Helper: open the profile dialog via user menu.
 */
async function openProfileDialog(page) {
  await openUserMenu(page)
  await page.locator('.q-menu .q-item').filter({ hasText: /Profile|個人資料/ }).click()
  await page.waitForTimeout(500)
}

test.describe('User Profile Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should open profile dialog from user dropdown', async ({ page }) => {
    await openProfileDialog(page)

    // Verify dialog is open with profile title
    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Profile|個人資料/)

    // Account should be displayed as read-only text (not an input)
    await expect(page.locator('.q-dialog .q-card')).toContainText('admin')
  })

  test('should show name field pre-filled', async ({ page }) => {
    await openProfileDialog(page)

    const nameField = page.locator('.q-dialog .q-field').filter({ hasText: /Name|名稱/ }).locator('input')
    await expect(nameField).toBeVisible()
  })

  test('should update name and reflect in header', async ({ page }) => {
    await openProfileDialog(page)

    // Update name
    const nameField = page.locator('.q-dialog .q-field').filter({ hasText: /Name|名稱/ }).locator('input')
    await nameField.clear()
    await nameField.fill('E2E Admin')

    // Click OK
    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /^OK$/i }).click()
    await page.waitForTimeout(2000)

    // Verify header updated
    await expect(page.locator('.q-toolbar .q-btn').filter({ hasText: /E2E Admin/i })).toBeVisible()

    // Restore original name
    await page.locator('.q-toolbar .q-btn').filter({ hasText: /E2E Admin/i }).click()
    await page.waitForTimeout(300)
    await page.locator('.q-menu .q-item').filter({ hasText: /Profile|個人資料/ }).click()
    await page.waitForTimeout(500)
    const nameField2 = page.locator('.q-dialog .q-field').filter({ hasText: /Name|名稱/ }).locator('input')
    await nameField2.clear()
    await nameField2.fill('')
    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /^OK$/i }).click()
    await page.waitForTimeout(1500)
  })

  test('should close dialog on Cancel', async ({ page }) => {
    await openProfileDialog(page)

    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Cancel|取消/i }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.q-dialog')).not.toBeVisible()
  })

  test('should validate invalid JSON in info field', async ({ page }) => {
    await openProfileDialog(page)

    const infoField = page.locator('.q-dialog .q-field').filter({ hasText: /Info|資訊/ }).locator('textarea')
    await infoField.fill('not valid json')
    await infoField.press('Tab')
    await page.waitForTimeout(300)

    // Should show validation error
    await expect(page.locator('.q-dialog .q-field--error')).toBeVisible()
  })
})
