import { describe, it, expect } from 'bun:test'
import {
  isValidUUID,
  isManifestoFormat,
  isRawInteger,
  toManifestoFormat,
  validateAndNormalizeAgendaId,
} from '@/lib/utils/uuid-helpers'

describe('uuid-helpers', () => {
  describe('isValidUUID', () => {
    it('should validate valid UUID v4', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
      expect(isValidUUID('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')).toBe(true)
    })

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false)
      expect(isValidUUID('12345')).toBe(false)
      expect(isValidUUID('123e4567-e89b-12d3-a456-42661417400')).toBe(false) // too short
    })
  })

  describe('isManifestoFormat', () => {
    it('should identify manifesto format IDs', () => {
      expect(isManifestoFormat('manifesto-1')).toBe(true)
      expect(isManifestoFormat('manifesto-27')).toBe(true)
      expect(isManifestoFormat('manifesto-105')).toBe(true)
    })

    it('should reject non-manifesto format IDs', () => {
      expect(isManifestoFormat('1')).toBe(false)
      expect(isManifestoFormat('agenda-1')).toBe(false)
      expect(isManifestoFormat('manifesto-')).toBe(false)
      expect(isManifestoFormat('manifesto-abc')).toBe(false)
    })
  })

  describe('isRawInteger', () => {
    it('should identify integer strings', () => {
      expect(isRawInteger('1')).toBe(true)
      expect(isRawInteger('27')).toBe(true)
      expect(isRawInteger('100')).toBe(true)
    })

    it('should reject non-integer strings', () => {
      expect(isRawInteger('1.5')).toBe(false)
      expect(isRawInteger('abc')).toBe(false)
      expect(isRawInteger('manifesto-1')).toBe(false)
    })
  })

  describe('toManifestoFormat', () => {
    it('should convert raw integer to manifesto format', () => {
      expect(toManifestoFormat('1')).toBe('manifesto-1')
      expect(toManifestoFormat('27')).toBe('manifesto-27')
    })

    it('should return already formatted string unchanged', () => {
      expect(toManifestoFormat('manifesto-5')).toBe('manifesto-5')
      expect(toManifestoFormat('custom-id')).toBe('custom-id')
    })
  })

  describe('validateAndNormalizeAgendaId', () => {
    it('should accept and preserve valid UUID as agendaUUID', async () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000'
      const result = await validateAndNormalizeAgendaId(validUUID)
      expect(result.isValid).toBe(true)
      expect(result.normalizedId).toBe(validUUID)
      expect(result.agendaUUID).toBe(validUUID)
    })

    it('should reject invalid formats', async () => {
      const result = await validateAndNormalizeAgendaId('invalid/id?test=1')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
