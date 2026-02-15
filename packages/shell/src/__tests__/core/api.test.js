import { describe, it, expect } from 'vitest'
import {
  userApi,
  clientApi,
  unitApi,
  applicationApi,
  networkApi,
  deviceApi,
  deviceRouteApi,
  networkRouteApi,
  dlDataBufferApi,
} from '@sylvia-iot/mfe-core/src/api/index.js'

describe('Core API helpers', () => {
  describe('Standard CRUD APIs', () => {
    const crudApis = [
      { name: 'userApi', api: userApi, ops: ['list', 'count', 'get', 'create', 'update', 'delete'] },
      { name: 'clientApi', api: clientApi, ops: ['list', 'count', 'get', 'create', 'update', 'delete'] },
      { name: 'unitApi', api: unitApi, ops: ['list', 'count', 'get', 'create', 'update', 'delete'] },
      { name: 'deviceApi', api: deviceApi, ops: ['list', 'count', 'get', 'create', 'update', 'delete'] },
    ]

    for (const { name, api, ops } of crudApis) {
      it(`${name} should have ${ops.join(', ')} functions`, () => {
        for (const op of ops) {
          expect(typeof api[op]).toBe('function')
        }
      })
    }
  })

  describe('Application API', () => {
    it('should have CRUD + stats + sendDlData', () => {
      expect(typeof applicationApi.list).toBe('function')
      expect(typeof applicationApi.count).toBe('function')
      expect(typeof applicationApi.get).toBe('function')
      expect(typeof applicationApi.create).toBe('function')
      expect(typeof applicationApi.update).toBe('function')
      expect(typeof applicationApi.delete).toBe('function')
      expect(typeof applicationApi.stats).toBe('function')
      expect(typeof applicationApi.sendDlData).toBe('function')
    })
  })

  describe('Network API', () => {
    it('should have CRUD + stats + sendUlData', () => {
      expect(typeof networkApi.list).toBe('function')
      expect(typeof networkApi.count).toBe('function')
      expect(typeof networkApi.get).toBe('function')
      expect(typeof networkApi.create).toBe('function')
      expect(typeof networkApi.update).toBe('function')
      expect(typeof networkApi.delete).toBe('function')
      expect(typeof networkApi.stats).toBe('function')
      expect(typeof networkApi.sendUlData).toBe('function')
    })
  })

  describe('Route APIs (immutable - no update)', () => {
    it('deviceRouteApi should have list, count, create, delete only', () => {
      expect(typeof deviceRouteApi.list).toBe('function')
      expect(typeof deviceRouteApi.count).toBe('function')
      expect(typeof deviceRouteApi.create).toBe('function')
      expect(typeof deviceRouteApi.delete).toBe('function')
      expect(deviceRouteApi.get).toBeUndefined()
      expect(deviceRouteApi.update).toBeUndefined()
    })

    it('networkRouteApi should have list, count, create, delete only', () => {
      expect(typeof networkRouteApi.list).toBe('function')
      expect(typeof networkRouteApi.count).toBe('function')
      expect(typeof networkRouteApi.create).toBe('function')
      expect(typeof networkRouteApi.delete).toBe('function')
      expect(networkRouteApi.get).toBeUndefined()
      expect(networkRouteApi.update).toBeUndefined()
    })
  })

  describe('DL Data Buffer API (read-only)', () => {
    it('should have list, count, delete only', () => {
      expect(typeof dlDataBufferApi.list).toBe('function')
      expect(typeof dlDataBufferApi.count).toBe('function')
      expect(typeof dlDataBufferApi.delete).toBe('function')
      expect(dlDataBufferApi.get).toBeUndefined()
      expect(dlDataBufferApi.create).toBeUndefined()
      expect(dlDataBufferApi.update).toBeUndefined()
    })
  })
})
