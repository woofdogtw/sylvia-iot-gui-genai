import { test, expect } from '@playwright/test'
import { login, navigateTo, waitForTableLoad, clickAddButton, clickDialogOk, clickDialogClose, clickDialogDelete } from './helpers.js'

test.describe('Device Management Page', () => {
  test.beforeAll(async ({ browser }) => {
    // Create prerequisite unit and network
    const page = await browser.newPage()
    await login(page)

    // Create unit
    await navigateTo(page, '/core/unit')
    await waitForTableLoad(page)
    await page.click('button[title="Add"], button[title="新增"]')
    await page.waitForTimeout(500)
    let dialog = page.locator('.q-dialog .q-card')
    await dialog.locator('.q-field').filter({ hasText: /Code|代碼/ }).locator('input').fill('e2edevunit')
    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /^OK$|^確定$/i }).click()
    await page.waitForTimeout(1500)

    // Create network
    await navigateTo(page, '/core/network')
    await waitForTableLoad(page)
    await page.click('button[title="Add"], button[title="新增"]')
    await page.waitForTimeout(500)
    dialog = page.locator('.q-dialog .q-card')
    await dialog.locator('.q-field').filter({ hasText: /Code|代碼/ }).locator('input').fill('e2edevnet')
    // Select unit
    await dialog.locator('.q-field').filter({ hasText: /Unit|單元/ }).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2edevunit' }).click()
    await page.waitForTimeout(300)
    await dialog.locator('.q-field').filter({ hasText: /Host URI/ }).locator('input').fill('amqp://localhost')
    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /^OK$|^確定$/i }).click()
    await page.waitForTimeout(1500)
    // Close password dialog if it appears
    const pwDialog = page.locator('.q-dialog .text-h6').filter({ hasText: /Password|密碼/ })
    if (await pwDialog.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Close|關閉/i }).click()
      await page.waitForTimeout(500)
    }
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateTo(page, '/core/device')
    await waitForTableLoad(page)
  })

  test('should display device list with table', async ({ page }) => {
    await expect(page.locator('.q-table')).toBeVisible()
  })

  test('should show unit filter and search input', async ({ page }) => {
    await expect(page.locator('.q-select').first()).toBeVisible()
    await expect(page.locator('input[placeholder]').first()).toBeVisible()
  })

  test('should open add dialog and create a device', async ({ page }) => {
    await clickAddButton(page)
    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Add|新增/)

    const dialog = page.locator('.q-dialog .q-card')

    // Select Unit
    await dialog.locator('.q-select').nth(0).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2edevunit' }).click()
    await page.waitForTimeout(500)

    // Select Network (filtered by unit)
    await dialog.locator('.q-select').nth(1).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2edevnet' }).click()
    await page.waitForTimeout(300)

    // Fill Network Address
    const addrField = dialog.locator('.q-field').filter({ hasText: /Address|位址/ }).locator('input')
    await addrField.fill('e2eaddr001')

    await clickDialogOk(page)
    await waitForTableLoad(page)

    await expect(page.locator('.q-table tbody')).toContainText('e2eaddr001')
  })

  test('should open detail dialog', async ({ page }) => {
    const row = page.locator('.q-table tbody tr', { hasText: 'e2eaddr001' })
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.locator('button').filter({ has: page.locator('.q-icon:has-text("info")') }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Detail|詳細/)
    await expect(page.locator('.q-dialog')).toContainText('e2eaddr001')
    await clickDialogClose(page)
  })

  test('should open edit dialog and update a device', async ({ page }) => {
    const row = page.locator('.q-table tbody tr', { hasText: 'e2eaddr001' })
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.locator('button').filter({ has: page.locator('.q-icon:has-text("edit")') }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Edit|編輯/)
    const dialog = page.locator('.q-dialog .q-card')
    const nameField = dialog.locator('.q-field').filter({ hasText: /Name|名稱/ }).locator('input')
    await nameField.fill('E2E Device')

    await clickDialogOk(page)
    await waitForTableLoad(page)
  })

  test('should show cascade delete warning and delete a device', async ({ page }) => {
    const row = page.locator('.q-table tbody tr', { hasText: 'e2eaddr001' })
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.q-dialog')).toContainText(/confirm|確認/i)
    await expect(page.locator('.q-dialog div.text-negative')).toBeVisible()

    await clickDialogDelete(page)
    await waitForTableLoad(page)

    await expect(page.locator('.q-table tbody')).not.toContainText('e2eaddr001')
  })

  test.afterAll(async ({ browser }) => {
    // Clean up: delete network then unit
    const page = await browser.newPage()
    await login(page)

    await navigateTo(page, '/core/network')
    await waitForTableLoad(page)
    const netRow = page.locator('.q-table tbody tr', { hasText: 'e2edevnet' })
    if (await netRow.count() > 0) {
      await netRow.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
      await page.waitForTimeout(500)
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Delete|刪除/i }).click()
      await page.waitForTimeout(1500)
    }

    await navigateTo(page, '/core/unit')
    await waitForTableLoad(page)
    const unitRow = page.locator('.q-table tbody tr', { hasText: 'e2edevunit' })
    if (await unitRow.count() > 0) {
      await unitRow.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
      await page.waitForTimeout(500)
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Delete|刪除/i }).click()
      await page.waitForTimeout(1500)
    }
    await page.close()
  })
})
