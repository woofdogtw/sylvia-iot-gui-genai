import { test, expect } from '@playwright/test'
import { login, navigateTo, waitForTableLoad, clickAddButton, clickDialogOk, clickDialogClose, clickRowAction } from './helpers.js'

test.describe('Client Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateTo(page, '/core/client')
    await waitForTableLoad(page)
  })

  test('should display client list with table', async ({ page }) => {
    await expect(page.locator('.q-table')).toBeVisible()
    // At least "public" and "private" clients should exist from test DB
    await expect(page.locator('.q-table tbody')).toContainText('public')
  })

  test('should show toolbar buttons', async ({ page }) => {
    await expect(page.locator('button[title="Refresh"], button[title="重新整理"]')).toBeVisible()
    await expect(page.locator('button[title="Add"], button[title="新增"]')).toBeVisible()
    await expect(page.locator('button[title="Export CSV"], button[title="匯出 CSV"]')).toBeVisible()
  })

  test('should open add dialog and create a public client', async ({ page }) => {
    await clickAddButton(page)
    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Add|新增/)

    const dialog = page.locator('.q-dialog .q-card')
    // Fill Name (first input)
    const nameField = dialog.locator('.q-field').filter({ hasText: /Name|名稱/ }).locator('input')
    await nameField.fill('E2E Test Client')

    // Fill Redirect URIs
    const redirectField = dialog.locator('.q-field').filter({ hasText: /Redirect/i }).locator('input')
    await redirectField.fill('http://localhost:9000/callback')

    await clickDialogOk(page)
    await waitForTableLoad(page)

    await expect(page.locator('.q-table tbody')).toContainText('E2E Test Client')
  })

  test('should open detail dialog for a client', async ({ page }) => {
    await clickRowAction(page, 0, 'info')
    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Detail|詳細/)
    await expect(page.locator('.q-dialog .q-list')).toBeVisible()
    await clickDialogClose(page)
  })

  test('should open edit dialog for a client', async ({ page }) => {
    const row = page.locator('.q-table tbody tr', { hasText: 'E2E Test Client' })
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.locator('button').filter({ has: page.locator('.q-icon:has-text("edit")') }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Edit|編輯/)

    // Update the name
    const dialog = page.locator('.q-dialog .q-card')
    const nameField = dialog.locator('.q-field').filter({ hasText: /Name|名稱/ }).locator('input')
    await nameField.fill('E2E Client Updated')

    await clickDialogOk(page)
    await waitForTableLoad(page)
  })

  test('should not show delete button for the current client (public)', async ({ page }) => {
    // "public" is the current client from config - should not have delete button
    // Use the clientId column text to find the exact row
    const rows = page.locator('.q-table tbody tr')
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
      const rowText = await rows.nth(i).textContent()
      // Check if this row is for the "public" client (clientId column)
      if (rowText.includes('public') && !rowText.includes('private')) {
        const deleteBtn = rows.nth(i).locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') })
        await expect(deleteBtn).toHaveCount(0)
        return
      }
    }
  })

  test('should delete a created client', async ({ page }) => {
    const row = page.locator('.q-table tbody tr', { hasText: 'E2E Client Updated' }).or(
      page.locator('.q-table tbody tr', { hasText: 'E2E Test Client' })
    )
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.first().locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.q-dialog')).toContainText(/confirm|確認/i)
    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Delete|刪除/i }).click()
    await page.waitForTimeout(1500)
    await waitForTableLoad(page)
  })
})
