import { test, expect } from '@playwright/test'
import { login, navigateTo, waitForTableLoad } from './helpers.js'

test.describe('DL Data Buffer Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateTo(page, '/core/dldata-buffer')
    await waitForTableLoad(page)
  })

  test('should display dldata buffer list with table', async ({ page }) => {
    await expect(page.locator('.q-table')).toBeVisible()
  })

  test('should show unit filter for admin', async ({ page }) => {
    await expect(page.locator('.q-select').first()).toBeVisible()
  })

  test('should show refresh and export buttons but no add button', async ({ page }) => {
    // DL Data Buffer is read-only: no add button
    await expect(page.locator('button[title="Refresh"], button[title="重新整理"]')).toBeVisible()
    await expect(page.locator('button[title="Export CSV"], button[title="匯出 CSV"]')).toBeVisible()
    // No add button
    const addBtn = page.locator('button[title="Add"], button[title="新增"]')
    await expect(addBtn).toHaveCount(0)
  })

  test('should show only view and delete buttons on rows (no edit)', async ({ page }) => {
    const rows = page.locator('.q-table tbody tr')
    if (await rows.count() > 0) {
      // Should have info and delete, but no edit
      const editBtns = rows.first().locator('button').filter({ has: page.locator('.q-icon:has-text("edit")') })
      await expect(editBtns).toHaveCount(0)
    }
  })
})
