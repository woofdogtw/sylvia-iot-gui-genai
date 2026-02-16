import { describe, it, expect } from 'vitest'
import {
  versionApi,
  sysApi,
  wanApi,
  lanApi,
  wlanApi,
  wwanApi,
} from '@sylvia-iot/mfe-router/src/api/index.js'

describe('Router API helpers', () => {
  it('versionApi should have get function', () => {
    expect(typeof versionApi.get).toBe('function')
  })

  it('sysApi should have getUsage and getTime functions', () => {
    expect(typeof sysApi.getUsage).toBe('function')
    expect(typeof sysApi.getTime).toBe('function')
  })

  it('wanApi should have list and update functions', () => {
    expect(typeof wanApi.list).toBe('function')
    expect(typeof wanApi.update).toBe('function')
  })

  it('lanApi should have get, update, and getLeases functions', () => {
    expect(typeof lanApi.get).toBe('function')
    expect(typeof lanApi.update).toBe('function')
    expect(typeof lanApi.getLeases).toBe('function')
  })

  it('wlanApi should have get and update functions', () => {
    expect(typeof wlanApi.get).toBe('function')
    expect(typeof wlanApi.update).toBe('function')
  })

  it('wwanApi should have get, update, and scan functions', () => {
    expect(typeof wwanApi.get).toBe('function')
    expect(typeof wwanApi.update).toBe('function')
    expect(typeof wwanApi.scan).toBe('function')
  })
})
