import { test, expect } from '@playwright/test'
import { login, navigateTo, waitForTableLoad, clickAddButton, clickDialogOk, clickDialogClose, clickDialogDelete, clickRowAction, getTableRowCount } from './helpers.js'

test.describe('User Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateTo(page, '/core/user')
    await waitForTableLoad(page)
  })

  test('should display user list with table', async ({ page }) => {
    // Table should be visible
    await expect(page.locator('.q-table')).toBeVisible()
    // At least admin user should exist
    const rowCount = await getTableRowCount(page)
    expect(rowCount).toBeGreaterThanOrEqual(1)
    // Should show "admin" account in the table
    await expect(page.locator('.q-table tbody')).toContainText('admin')
  })

  test('should show toolbar with search, refresh, add and export buttons', async ({ page }) => {
    await expect(page.locator('input[placeholder]').first()).toBeVisible()
    await expect(page.locator('button[title="Refresh"], button[title="重新整理"]')).toBeVisible()
    await expect(page.locator('button[title="Add"], button[title="新增"]')).toBeVisible()
    await expect(page.locator('button[title="Export CSV"], button[title="匯出 CSV"]')).toBeVisible()
  })

  test('should open add dialog and create a user', async ({ page }) => {
    await clickAddButton(page)
    // Dialog should appear with "Add" title
    await expect(page.locator('.q-dialog .q-card')).toBeVisible()
    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Add|新增/)

    // Fill form
    const dialog = page.locator('.q-dialog .q-card')
    await dialog.locator('input').nth(0).fill('e2euser1')
    await dialog.locator('input[type="password"]').fill('test1234')

    await clickDialogOk(page)

    // Table should refresh and contain the new user
    await waitForTableLoad(page)
    await expect(page.locator('.q-table tbody')).toContainText('e2euser1')
  })

  test('should open detail dialog for a user', async ({ page }) => {
    await clickRowAction(page, 0, 'info')
    // Detail dialog should show
    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Detail|詳細/)
    await expect(page.locator('.q-dialog .q-list')).toBeVisible()
    await clickDialogClose(page)
  })

  test('should open edit dialog and update a user', async ({ page }) => {
    // Find the e2euser1 row
    const row = page.locator('.q-table tbody tr', { hasText: 'e2euser1' })
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.locator('button').filter({ has: page.locator('.q-icon:has-text("edit")') }).click()
    await page.waitForTimeout(500)

    // Edit dialog should appear
    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Edit|編輯/)

    // Fill name field
    const dialog = page.locator('.q-dialog .q-card')
    const nameInput = dialog.locator('.q-field').filter({ hasText: /Name|名稱/ }).locator('input')
    await nameInput.fill('E2E Test User')

    await clickDialogOk(page)
    await waitForTableLoad(page)
  })

  test('should open delete dialog and delete a user', async ({ page }) => {
    const row = page.locator('.q-table tbody tr', { hasText: 'e2euser1' })
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
    await page.waitForTimeout(500)

    // Delete confirmation dialog
    await expect(page.locator('.q-dialog')).toContainText(/confirm|確認/i)
    await expect(page.locator('.q-dialog')).toContainText('e2euser1')

    await clickDialogDelete(page)
    await waitForTableLoad(page)

    // User should be removed
    await expect(page.locator('.q-table tbody')).not.toContainText('e2euser1')
  })

  test('should search users by account', async ({ page }) => {
    const searchInput = page.locator('input[placeholder]').first()
    await searchInput.fill('admin')
    await searchInput.press('Enter')
    await waitForTableLoad(page)

    await expect(page.locator('.q-table tbody')).toContainText('admin')
  })
})
