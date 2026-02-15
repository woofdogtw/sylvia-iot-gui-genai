import { test, expect } from '@playwright/test'
import { login, navigateTo, waitForTableLoad, clickAddButton, clickDialogOk, clickDialogClose, clickDialogDelete } from './helpers.js'

test.describe('Network Management Page', () => {
  test.beforeAll(async ({ browser }) => {
    // Create a unit for network tests
    const page = await browser.newPage()
    await login(page)
    await navigateTo(page, '/core/unit')
    await waitForTableLoad(page)
    await page.click('button[title="Add"], button[title="新增"]')
    await page.waitForTimeout(500)
    const dialog = page.locator('.q-dialog .q-card')
    await dialog.locator('.q-field').filter({ hasText: /Code|代碼/ }).locator('input').fill('e2enetunit')
    await dialog.locator('.q-field').filter({ hasText: /Name|名稱/ }).locator('input').fill('Net Test Unit')
    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /^OK$|^確定$/i }).click()
    await page.waitForTimeout(1500)
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateTo(page, '/core/network')
    await waitForTableLoad(page)
  })

  test('should display network list with table', async ({ page }) => {
    await expect(page.locator('.q-table')).toBeVisible()
  })

  test('should show unit filter for admin', async ({ page }) => {
    await expect(page.locator('.q-select').first()).toBeVisible()
  })

  test('should open add dialog and create a network', async ({ page }) => {
    await clickAddButton(page)
    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Add|新增/)

    const dialog = page.locator('.q-dialog .q-card')

    // Fill Code
    await dialog.locator('.q-field').filter({ hasText: /Code|代碼/ }).locator('input').fill('e2enet1')

    // Select Unit
    await dialog.locator('.q-field').filter({ hasText: /Unit|單元/ }).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2enetunit' }).click()
    await page.waitForTimeout(300)

    // Fill Host URI
    await dialog.locator('.q-field').filter({ hasText: /Host URI/ }).locator('input').fill('amqp://localhost')

    await clickDialogOk(page)

    // Password display dialog may appear
    const pwDialog = page.locator('.q-dialog .text-h6').filter({ hasText: /Password|密碼/ })
    if (await pwDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Close|關閉/i }).click()
      await page.waitForTimeout(500)
    }

    await waitForTableLoad(page)
    await expect(page.locator('.q-table tbody')).toContainText('e2enet1')
  })

  test('should open detail dialog', async ({ page }) => {
    const row = page.locator('.q-table tbody tr', { hasText: 'e2enet1' })
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.locator('button').filter({ has: page.locator('.q-icon:has-text("info")') }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Detail|詳細/)
    await expect(page.locator('.q-dialog')).toContainText('e2enet1')
    await clickDialogClose(page)
  })

  test('should open edit dialog', async ({ page }) => {
    const row = page.locator('.q-table tbody tr', { hasText: 'e2enet1' })
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.locator('button').filter({ has: page.locator('.q-icon:has-text("edit")') }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Edit|編輯/)

    const dialog = page.locator('.q-dialog .q-card')
    const nameField = dialog.locator('.q-field').filter({ hasText: /Name|名稱/ }).locator('input')
    await nameField.fill('E2E Net Updated')

    await clickDialogOk(page)
    await waitForTableLoad(page)
  })

  test('should open stats dialog', async ({ page }) => {
    const row = page.locator('.q-table tbody tr', { hasText: 'e2enet1' })
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.locator('button').filter({ has: page.locator('.q-icon:has-text("bar_chart")') }).click()
    await page.waitForTimeout(1500)

    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Stats|統計/)
    await expect(page.locator('.q-dialog .q-markup-table')).toBeVisible()

    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Close|關閉/i }).click()
    await page.waitForTimeout(500)
  })

  test('should delete a network', async ({ page }) => {
    const row = page.locator('.q-table tbody tr', { hasText: 'e2enet1' })
    if (await row.count() === 0) {
      test.skip()
      return
    }
    await row.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.q-dialog')).toContainText(/confirm|確認/i)
    await clickDialogDelete(page)
    await waitForTableLoad(page)

    await expect(page.locator('.q-table tbody')).not.toContainText('e2enet1')
  })

  test.afterAll(async ({ browser }) => {
    // Clean up the test unit
    const page = await browser.newPage()
    await login(page)
    await navigateTo(page, '/core/unit')
    await waitForTableLoad(page)
    const row = page.locator('.q-table tbody tr', { hasText: 'e2enetunit' })
    if (await row.count() > 0) {
      await row.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
      await page.waitForTimeout(500)
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Delete|刪除/i }).click()
      await page.waitForTimeout(1500)
    }
    await page.close()
  })
})
