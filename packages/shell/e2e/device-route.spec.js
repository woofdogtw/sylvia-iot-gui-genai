import { test, expect } from '@playwright/test'
import { login, navigateTo, waitForTableLoad, clickAddButton, clickDialogOk, clickDialogClose, clickDialogDelete } from './helpers.js'

test.describe('Device Route Management Page', () => {
  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(60000)
    // Create prerequisite: unit → network → device + application
    const page = await browser.newPage()
    await login(page)

    // Create unit
    await navigateTo(page, '/core/unit')
    await waitForTableLoad(page)
    await page.click('button[title="Add"], button[title="新增"]')
    await page.waitForTimeout(500)
    let dialog = page.locator('.q-dialog .q-card')
    await dialog.locator('.q-field').filter({ hasText: /Code|代碼/ }).locator('input').fill('e2edrunit')
    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /^OK$|^確定$/i }).click()
    await page.waitForTimeout(1500)

    // Create network
    await navigateTo(page, '/core/network')
    await waitForTableLoad(page)
    await page.click('button[title="Add"], button[title="新增"]')
    await page.waitForTimeout(500)
    dialog = page.locator('.q-dialog .q-card')
    await dialog.locator('.q-field').filter({ hasText: /Code|代碼/ }).locator('input').fill('e2edrnet')
    await dialog.locator('.q-field').filter({ hasText: /Unit|單元/ }).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2edrunit' }).click()
    await page.waitForTimeout(300)
    await dialog.locator('.q-field').filter({ hasText: /Host URI/ }).locator('input').fill('amqp://localhost')
    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /^OK$|^確定$/i }).click()
    await page.waitForTimeout(1500)
    // Close password dialog
    const pwDialog1 = page.locator('.q-dialog .text-h6').filter({ hasText: /Password|密碼/ })
    if (await pwDialog1.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Close|關閉/i }).click()
      await page.waitForTimeout(500)
    }

    // Create application
    await navigateTo(page, '/core/application')
    await waitForTableLoad(page)
    await page.click('button[title="Add"], button[title="新增"]')
    await page.waitForTimeout(500)
    dialog = page.locator('.q-dialog .q-card')
    await dialog.locator('.q-field').filter({ hasText: /Code|代碼/ }).locator('input').fill('e2edrapp')
    await dialog.locator('.q-field').filter({ hasText: /Unit|單元/ }).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2edrunit' }).click()
    await page.waitForTimeout(300)
    await dialog.locator('.q-field').filter({ hasText: /Host URI/ }).locator('input').fill('amqp://localhost')
    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /^OK$|^確定$/i }).click()
    await page.waitForTimeout(1500)
    const pwDialog2 = page.locator('.q-dialog .text-h6').filter({ hasText: /Password|密碼/ })
    if (await pwDialog2.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Close|關閉/i }).click()
      await page.waitForTimeout(500)
    }

    // Create device
    await navigateTo(page, '/core/device')
    await waitForTableLoad(page)
    await page.click('button[title="Add"], button[title="新增"]')
    await page.waitForTimeout(500)
    dialog = page.locator('.q-dialog .q-card')
    // Select Unit
    await dialog.locator('.q-select').nth(0).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2edrunit' }).click()
    await page.waitForTimeout(500)
    // Select Network
    await dialog.locator('.q-select').nth(1).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2edrnet' }).click()
    await page.waitForTimeout(300)
    // Network address
    await dialog.locator('.q-field').filter({ hasText: /Address|位址/ }).locator('input').fill('e2edraddr')
    await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /^OK$|^確定$/i }).click()
    await page.waitForTimeout(1500)

    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateTo(page, '/core/device-route')
    await waitForTableLoad(page)
  })

  test('should display device route list with table', async ({ page }) => {
    await expect(page.locator('.q-table')).toBeVisible()
  })

  test('should show unit filter', async ({ page }) => {
    await expect(page.locator('.q-select').first()).toBeVisible()
  })

  test('should not show edit buttons (immutable)', async ({ page }) => {
    const rows = page.locator('.q-table tbody tr')
    if (await rows.count() > 0) {
      // Should only have info and delete, no edit button
      const editBtns = rows.first().locator('button').filter({ has: page.locator('.q-icon:has-text("edit")') })
      await expect(editBtns).toHaveCount(0)
    }
  })

  test('should open add dialog and create a device route', async ({ page }) => {
    await clickAddButton(page)
    await expect(page.locator('.q-dialog .text-h6')).toContainText(/Add|新增/)

    const dialog = page.locator('.q-dialog .q-card')

    // Select Unit
    await dialog.locator('.q-select').nth(0).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2edrunit' }).click()
    await page.waitForTimeout(500)

    // Select Application
    await dialog.locator('.q-select').nth(1).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2edrapp' }).click()
    await page.waitForTimeout(300)

    // Select Device
    await dialog.locator('.q-select').nth(2).locator('.q-select__dropdown-icon').click()
    await page.waitForTimeout(500)
    await page.locator('.q-item').filter({ hasText: 'e2edraddr' }).click()
    await page.waitForTimeout(300)

    await clickDialogOk(page)
    await waitForTableLoad(page)

    // Should see the route in the table
    await expect(page.locator('.q-table tbody tr')).not.toHaveCount(0)
  })

  test('should open detail dialog for a device route', async ({ page }) => {
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

  test('should delete a device route', async ({ page }) => {
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

  test.afterAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(60000)
    // Clean up: device → network → application → unit
    const page = await browser.newPage()
    await login(page)

    // Delete device
    await navigateTo(page, '/core/device')
    await waitForTableLoad(page)
    const devRow = page.locator('.q-table tbody tr', { hasText: 'e2edraddr' })
    if (await devRow.count() > 0) {
      await devRow.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
      await page.waitForTimeout(500)
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Delete|刪除/i }).click()
      await page.waitForTimeout(1500)
    }

    // Delete application
    await navigateTo(page, '/core/application')
    await waitForTableLoad(page)
    const appRow = page.locator('.q-table tbody tr', { hasText: 'e2edrapp' })
    if (await appRow.count() > 0) {
      await appRow.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
      await page.waitForTimeout(500)
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Delete|刪除/i }).click()
      await page.waitForTimeout(1500)
    }

    // Delete network
    await navigateTo(page, '/core/network')
    await waitForTableLoad(page)
    const netRow = page.locator('.q-table tbody tr', { hasText: 'e2edrnet' })
    if (await netRow.count() > 0) {
      await netRow.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
      await page.waitForTimeout(500)
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Delete|刪除/i }).click()
      await page.waitForTimeout(1500)
    }

    // Delete unit
    await navigateTo(page, '/core/unit')
    await waitForTableLoad(page)
    const unitRow = page.locator('.q-table tbody tr', { hasText: 'e2edrunit' })
    if (await unitRow.count() > 0) {
      await unitRow.locator('button').filter({ has: page.locator('.q-icon:has-text("delete")') }).click()
      await page.waitForTimeout(500)
      await page.locator('.q-dialog .q-card .q-card__actions .q-btn').filter({ hasText: /Delete|刪除/i }).click()
      await page.waitForTimeout(1500)
    }
    await page.close()
  })
})
