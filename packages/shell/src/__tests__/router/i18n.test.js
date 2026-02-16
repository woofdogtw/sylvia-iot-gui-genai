import { describe, it, expect } from 'vitest'
import routerMessages from '@sylvia-iot/mfe-router/i18n'

describe('Router plugin i18n', () => {
  it('should export en-US and zh-TW locales', () => {
    expect(routerMessages['en-US']).toBeDefined()
    expect(routerMessages['zh-TW']).toBeDefined()
  })

  it('should have router namespace in both locales', () => {
    expect(routerMessages['en-US'].router).toBeDefined()
    expect(routerMessages['zh-TW'].router).toBeDefined()
  })

  it('should have all 5 menu item translations', () => {
    const menuKeys = ['dashboard', 'wan', 'lan', 'wlan', 'wwan']
    for (const key of menuKeys) {
      expect(routerMessages['en-US'].router.menu[key]).toBeTruthy()
      expect(routerMessages['zh-TW'].router.menu[key]).toBeTruthy()
    }
  })

  it('should have common UI translations', () => {
    const commonKeys = ['save', 'cancel', 'edit', 'refresh', 'enabled', 'disabled', 'notSupported', 'saveSuccess']
    for (const key of commonKeys) {
      expect(routerMessages['en-US'].router.common[key]).toBeTruthy()
      expect(routerMessages['zh-TW'].router.common[key]).toBeTruthy()
    }
  })

  it('should have dashboard translations', () => {
    const dashboardKeys = ['title', 'cpu', 'cpuPerCore', 'cpuOverall', 'memory', 'disk']
    for (const key of dashboardKeys) {
      expect(routerMessages['en-US'].router.dashboard[key]).toBeTruthy()
      expect(routerMessages['zh-TW'].router.dashboard[key]).toBeTruthy()
    }
  })

  it('should have wan page translations', () => {
    const wanKeys = ['title', 'type', 'typeDisable', 'typeEthernet', 'typePppoe', 'address', 'gateway', 'dns']
    for (const key of wanKeys) {
      expect(routerMessages['en-US'].router.wan[key]).toBeTruthy()
      expect(routerMessages['zh-TW'].router.wan[key]).toBeTruthy()
    }
  })

  it('should have lan page translations', () => {
    const lanKeys = ['title', 'address', 'dhcpEnabled', 'dhcpStart', 'dhcpEnd', 'leaseTime', 'leases']
    for (const key of lanKeys) {
      expect(routerMessages['en-US'].router.lan[key]).toBeTruthy()
      expect(routerMessages['zh-TW'].router.lan[key]).toBeTruthy()
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

    const enKeys = getKeys(routerMessages['en-US'])
    const zhKeys = getKeys(routerMessages['zh-TW'])
    expect(enKeys).toEqual(zhKeys)
  })
})
