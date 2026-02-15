import { describe, it, expect } from 'vitest'
import {
  validateCode,
  validateHostUri,
  validateNonNegativeInt,
  validateJsonObject,
  parseJsonInfo,
  trimValue,
  textToHex,
} from '@sylvia-iot/mfe-core/src/utils/validate.js'

describe('Validation utilities', () => {
  describe('validateCode', () => {
    it('should accept valid codes', () => {
      expect(validateCode('abc')).toBe(true)
      expect(validateCode('A1')).toBe(true)
      expect(validateCode('test-code_123')).toBe(true)
      expect(validateCode('0abc')).toBe(true)
    })

    it('should reject empty value', () => {
      expect(validateCode('')).toBe('core.validate.required')
      expect(validateCode(null)).toBe('core.validate.required')
    })

    it('should reject invalid patterns', () => {
      expect(validateCode('-start')).toBe('core.validate.codePattern')
      expect(validateCode('_start')).toBe('core.validate.codePattern')
      expect(validateCode('has space')).toBe('core.validate.codePattern')
      expect(validateCode('special!char')).toBe('core.validate.codePattern')
    })
  })

  describe('validateHostUri', () => {
    it('should accept valid URIs', () => {
      expect(validateHostUri('amqp://localhost')).toBe(true)
      expect(validateHostUri('amqps://broker.example.com:5671')).toBe(true)
      expect(validateHostUri('mqtt://localhost:1883')).toBe(true)
      expect(validateHostUri('mqtts://secure.broker.io')).toBe(true)
    })

    it('should reject empty value', () => {
      expect(validateHostUri('')).toBe('core.validate.required')
    })

    it('should reject invalid schemes', () => {
      expect(validateHostUri('http://localhost')).toBe('core.validate.hostUri')
      expect(validateHostUri('tcp://localhost')).toBe('core.validate.hostUri')
      expect(validateHostUri('just-a-string')).toBe('core.validate.hostUri')
    })
  })

  describe('validateNonNegativeInt', () => {
    it('should accept valid values', () => {
      expect(validateNonNegativeInt(0)).toBe(true)
      expect(validateNonNegativeInt(42)).toBe(true)
      expect(validateNonNegativeInt('100')).toBe(true)
    })

    it('should accept empty values (optional)', () => {
      expect(validateNonNegativeInt('')).toBe(true)
      expect(validateNonNegativeInt(null)).toBe(true)
      expect(validateNonNegativeInt(undefined)).toBe(true)
    })

    it('should reject negative numbers', () => {
      expect(validateNonNegativeInt(-1)).toBe('core.validate.nonNegativeInt')
    })

    it('should reject non-integer values', () => {
      expect(validateNonNegativeInt(1.5)).toBe('core.validate.nonNegativeInt')
      expect(validateNonNegativeInt('abc')).toBe('core.validate.nonNegativeInt')
    })
  })

  describe('validateJsonObject', () => {
    it('should accept valid JSON objects', () => {
      expect(validateJsonObject('{"key": "value"}')).toBe(true)
      expect(validateJsonObject('{}')).toBe(true)
      expect(validateJsonObject('{"nested": {"a": 1}}')).toBe(true)
    })

    it('should accept empty/whitespace values', () => {
      expect(validateJsonObject('')).toBe(true)
      expect(validateJsonObject('   ')).toBe(true)
      expect(validateJsonObject(null)).toBe(true)
    })

    it('should reject non-object JSON', () => {
      expect(validateJsonObject('"string"')).toBe('core.validate.jsonObject')
      expect(validateJsonObject('42')).toBe('core.validate.jsonObject')
      expect(validateJsonObject('[1, 2]')).toBe('core.validate.jsonObject')
      expect(validateJsonObject('null')).toBe('core.validate.jsonObject')
    })

    it('should reject invalid JSON', () => {
      expect(validateJsonObject('{bad}')).toBe('core.validate.jsonObject')
      expect(validateJsonObject('not json')).toBe('core.validate.jsonObject')
    })
  })

  describe('parseJsonInfo', () => {
    it('should parse valid JSON', () => {
      expect(parseJsonInfo('{"key": "val"}')).toEqual({ key: 'val' })
    })

    it('should return empty object for empty input', () => {
      expect(parseJsonInfo('')).toEqual({})
      expect(parseJsonInfo('  ')).toEqual({})
      expect(parseJsonInfo(null)).toEqual({})
    })
  })

  describe('trimValue', () => {
    it('should trim strings', () => {
      expect(trimValue('  hello  ')).toBe('hello')
      expect(trimValue('no-trim')).toBe('no-trim')
    })

    it('should handle non-string values', () => {
      expect(trimValue(42)).toBe(42)
      expect(trimValue(null)).toBe(null)
    })
  })

  describe('textToHex', () => {
    it('should convert ASCII text to hex', () => {
      expect(textToHex('hello')).toBe('68656c6c6f')
      expect(textToHex('ABC')).toBe('414243')
    })

    it('should handle empty string', () => {
      expect(textToHex('')).toBe('')
    })

    it('should handle UTF-8 characters', () => {
      // UTF-8 encoding of '中' is e4b8ad
      expect(textToHex('中')).toBe('e4b8ad')
    })
  })
})
