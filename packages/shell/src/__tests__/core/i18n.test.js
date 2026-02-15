import { describe, it, expect } from 'vitest'
import coreMessages from '@sylvia-iot/mfe-core/i18n'

describe('Core plugin i18n', () => {
  it('should export en-US and zh-TW locales', () => {
    expect(coreMessages['en-US']).toBeDefined()
    expect(coreMessages['zh-TW']).toBeDefined()
  })

  it('should have core namespace in both locales', () => {
    expect(coreMessages['en-US'].core).toBeDefined()
    expect(coreMessages['zh-TW'].core).toBeDefined()
  })

  it('should have all 9 menu item translations', () => {
    const menuKeys = [
      'user', 'client', 'unit', 'application', 'network',
      'device', 'deviceRoute', 'networkRoute', 'dlDataBuffer',
    ]
    for (const key of menuKeys) {
      expect(coreMessages['en-US'].core.menu[key]).toBeTruthy()
      expect(coreMessages['zh-TW'].core.menu[key]).toBeTruthy()
    }
  })

  it('should have title translations for all pages', () => {
    const pages = [
      'user', 'client', 'unit', 'application', 'network',
      'device', 'deviceRoute', 'networkRoute', 'dlDataBuffer',
    ]
    for (const page of pages) {
      expect(coreMessages['en-US'].core[page]?.title).toBeTruthy()
      expect(coreMessages['zh-TW'].core[page]?.title).toBeTruthy()
    }
  })

  it('should have common UI translations', () => {
    const commonKeys = [
      'add', 'edit', 'delete', 'detail', 'refresh', 'search',
      'exportCsv', 'ok', 'cancel', 'confirm', 'close',
    ]
    for (const key of commonKeys) {
      expect(coreMessages['en-US'].core.common[key]).toBeTruthy()
      expect(coreMessages['zh-TW'].core.common[key]).toBeTruthy()
    }
  })

  it('should have validation message translations', () => {
    const validateKeys = ['required', 'codePattern', 'hostUri', 'nonNegativeInt', 'jsonObject']
    for (const key of validateKeys) {
      expect(coreMessages['en-US'].core.validate[key]).toBeTruthy()
      expect(coreMessages['zh-TW'].core.validate[key]).toBeTruthy()
    }
  })

  it('en-US and zh-TW should have the same structure', () => {
    function getKeys(obj, prefix = '') {
      const keys = []
      for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k
        if (typeof v === 'object' && v !== null) {
          keys.push(...getKeys(v, fullKey))
        } else {
          keys.push(fullKey)
        }
      }
      return keys.sort()
    }

    const enKeys = getKeys(coreMessages['en-US'])
    const zhKeys = getKeys(coreMessages['zh-TW'])
    expect(enKeys).toEqual(zhKeys)
  })
})
