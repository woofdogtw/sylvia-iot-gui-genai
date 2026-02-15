import { test, expect } from '@playwright/test'
import { login, navigateTo, waitForTableLoad, clickAddButton, clickDialogOk, clickDialogClose, clickDialogDelete } from './helpers.js'

test.describe('Network Route Management Page', () => {
  test.beforeAll(async ({ browser }) => {
    // Create prerequisite: unit → network + application
    const page = await browser.newPage()
    await login(page)

    // Create unit
    await navigateTo(page, '/core/unit')
    await waitForTableLoad(page)
    await page.click('button[title="Add"], button[title="新增"]')
    await page.waitForTimeout(500)
    let dialog = page.locator('.q-dialog .q-card')
    await dialog.locator('.q-field').filter({ hasText: /Code|代碼/ }).locator('input').fill('e2enrunit')
    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /^OK$|^確定$/i }).click()
    await page.waitForTimeout(1500)

    // Create network
    await navigateTo(page, '/core/network')
    await waitForTableLoad(page)
    await page.click('button[title="Add"], button[title="新增"]')
    await page.waitForTimeout(500)
    dialog = page.locator('.q-dialog .q-card')
    await dialog.locator('.q-field').filter({ hasText: /Code|代碼/ }).locator('input').fill('e2enrnet')
    await dialog.locator('.q-field').filter({ hasText: /Unit|單元/ }).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2enrunit' }).click()
    await page.waitForTimeout(300)
    await dialog.locator('.q-field').filter({ hasText: /Host URI/ }).locator('input').fill('amqp://localhost')
    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /^OK$|^確定$/i }).click()
    await page.waitForTimeout(1500)
    let pwDialog = page.locator('.q-dialog .text-h6').filter({ hasText: /Password|密碼/ })
    if (await pwDialog.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Close|關閉/i }).click()
      await page.waitForTimeout(500)
    }

    // Create application
    await navigateTo(page, '/core/application')
    await waitForTableLoad(page)
    await page.click('button[title="Add"], button[title="新增"]')
    await page.waitForTimeout(500)
    dialog = page.locator('.q-dialog .q-card')
    await dialog.locator('.q-field').filter({ hasText: /Code|代碼/ }).locator('input').fill('e2enrapp')
    await dialog.locator('.q-field').filter({ hasText: /Unit|單元/ }).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2enrunit' }).click()
    await page.waitForTimeout(300)
    await dialog.locator('.q-field').filter({ hasText: /Host URI/ }).locator('input').fill('amqp://localhost')
    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /^OK$|^確定$/i }).click()
    await page.waitForTimeout(1500)
    pwDialog = page.locator('.q-dialog .text-h6').filter({ hasText: /Password|密碼/ })
    if (await pwDialog.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Close|關閉/i }).click()
      await page.waitForTimeout(500)
    }

    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateTo(page, '/core/network-route')
    await waitForTableLoad(page)
  })

  test('should display network route list with table', async ({ page }) => {
    await expect(page.locator('.q-table')).toBeVisible()
  })

  test('should not show edit buttons (immutable)', async ({ page }) => {
    const rows = page.locator('.q-table tbody tr')
    if (await rows.count() > 0) {
      const editBtns = rows.first().locator('button').filter({ has: page.locator('.q-icon:has-text("edit")') })
      await expect(editBtns).toHaveCount(0)
    }
  })

  test('should open add dialog and create a network route', async ({ page }) => {
    await clickAddButton(page)
    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Add|新增/)

    const dialog = page.locator('.q-dialog .q-card')

    // Select Unit
    await dialog.locator('.q-select').nth(0).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2enrunit' }).click()
    await page.waitForTimeout(500)

    // Select Application
    await dialog.locator('.q-select').nth(1).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2enrapp' }).click()
    await page.waitForTimeout(300)

    // Select Network
    await dialog.locator('.q-select').nth(2).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2enrnet' }).click()
    await page.waitForTimeout(300)

    await clickDialogOk(page)
    await waitForTableLoad(page)

    await expect(page.locator('.q-table tbody tr')).not.toHaveCount(0)
  })

  test('should open detail dialog', async ({ page }) => {
    const rows = page.locator('.q-table tbody tr')
    if (await rows.count() === 0) {
      test.skip()
      return
    }
    await rows.first().locator('button').filter({ has: page.locator('.q-icon:has-text("info")') }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Detail|詳細/)
    await clickDialogClose(page)
  })

  test('should delete a network route', async ({ page }) => {
    const rows = page.locator('.q-table tbody tr')
    if (await rows.count() === 0) {
      test.skip()
      return
    }
    await rows.first().locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.q-dialog')).toContainText(/confirm|確認/i)
    await clickDialogDelete(page)
    await waitForTableLoad(page)
  })

  test.afterAll(async ({ browser }) => {
    // Clean up: application → network → unit
    const page = await browser.newPage()
    await login(page)

    await navigateTo(page, '/core/application')
    await waitForTableLoad(page)
    const appRow = page.locator('.q-table tbody tr', { hasText: 'e2enrapp' })
    if (await appRow.count() > 0) {
      await appRow.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
      await page.waitForTimeout(500)
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Delete|刪除/i }).click()
      await page.waitForTimeout(1500)
    }

    await navigateTo(page, '/core/network')
    await waitForTableLoad(page)
    const netRow = page.locator('.q-table tbody tr', { hasText: 'e2enrnet' })
    if (await netRow.count() > 0) {
      await netRow.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
      await page.waitForTimeout(500)
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Delete|刪除/i }).click()
      await page.waitForTimeout(1500)
    }

    await navigateTo(page, '/core/unit')
    await waitForTableLoad(page)
    const unitRow = page.locator('.q-table tbody tr', { hasText: 'e2enrunit' })
    if (await unitRow.count() > 0) {
      await unitRow.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
      await page.waitForTimeout(500)
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Delete|刪除/i }).click()
      await page.waitForTimeout(1500)
    }
    await page.close()
  })
})
