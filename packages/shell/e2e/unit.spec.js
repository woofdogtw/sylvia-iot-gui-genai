import { test, expect } from '@playwright/test'
import { login, navigateTo, waitForTableLoad, clickAddButton, clickDialogOk, clickDialogClose, clickDialogDelete, clickRowAction } from './helpers.js'

test.describe('Unit Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateTo(page, '/core/unit')
    await waitForTableLoad(page)
  })

  test('should display unit list with table', async ({ page }) => {
    await expect(page.locator('.q-table')).toBeVisible()
  })

  test('should show toolbar with search, refresh, add and export buttons', async ({ page }) => {
    await expect(page.locator('input[placeholder]').first()).toBeVisible()
    await expect(page.locator('button[title="Refresh"], button[title="重新整理"]')).toBeVisible()
    await expect(page.locator('button[title="Add"], button[title="新增"]')).toBeVisible()
    await expect(page.locator('button[title="Export CSV"], button[title="匯出 CSV"]')).toBeVisible()
  })

  test('should open add dialog and create a unit', async ({ page }) => {
    await clickAddButton(page)
    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Add|新增/)

    const dialog = page.locator('.q-dialog .q-card')
    // Fill Code
    const codeField = dialog.locator('.q-field').filter({ hasText: /Code|代碼/ }).locator('input')
    await codeField.fill('e2eunit1')

    // Fill Name
    const nameField = dialog.locator('.q-field').filter({ hasText: /Name|名稱/ }).locator('input')
    await nameField.fill('E2E Test Unit')

    await clickDialogOk(page)
    await waitForTableLoad(page)

    await expect(page.locator('.q-table tbody')).toContainText('e2eunit1')
  })

  test('should open detail dialog', async ({ page }) => {
    const row = page.locator('.q-table tbody tr', { hasText: 'e2eunit1' })
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.locator('button').filter({ has: page.locator('.q-icon:has-text("info")') }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Detail|詳細/)
    await expect(page.locator('.q-dialog')).toContainText('e2eunit1')
    await clickDialogClose(page)
  })

  test('should open edit dialog and update a unit', async ({ page }) => {
    const row = page.locator('.q-table tbody tr', { hasText: 'e2eunit1' })
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.locator('button').filter({ has: page.locator('.q-icon:has-text("edit")') }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Edit|編輯/)

    const dialog = page.locator('.q-dialog .q-card')
    const nameField = dialog.locator('.q-field').filter({ hasText: /Name|名稱/ }).locator('input')
    await nameField.fill('E2E Unit Updated')

    await clickDialogOk(page)
    await waitForTableLoad(page)
  })

  test('should search units by code', async ({ page }) => {
    const searchInput = page.locator('input[placeholder]').first()
    await searchInput.fill('e2eunit1')
    await searchInput.press('Enter')
    await waitForTableLoad(page)

    await expect(page.locator('.q-table tbody')).toContainText('e2eunit1')
  })

  test('should show cascade delete warning and delete a unit', async ({ page }) => {
    const row = page.locator('.q-table tbody tr', { hasText: 'e2eunit1' })
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
    await page.waitForTimeout(500)

    // Should show confirm dialog with cascade warning
    await expect(page.locator('.q-dialog')).toContainText(/confirm|確認/i)
    await expect(page.locator('.q-dialog .text-negative').first()).toBeVisible()

    await clickDialogDelete(page)
    await waitForTableLoad(page)

    await expect(page.locator('.q-table tbody')).not.toContainText('e2eunit1')
  })
})
