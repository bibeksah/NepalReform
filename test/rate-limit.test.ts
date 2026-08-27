import { describe, it, expect } from 'bun:test'
import { checkRateLimit } from '@/lib/security/rate-limit'

function createMockRequest(ip: string = '127.0.0.1'): Request {
  return new Request('http://localhost:3000/api/test', {
    headers: {
      'x-forwarded-for': ip,
    },
  })
}

describe('checkRateLimit', () => {
  it('should allow requests within limit', () => {
    const key = `test-limit-${Date.now()}`
    const req = createMockRequest('192.168.1.1')

    const res1 = checkRateLimit(req, key, 3, 60000)
    expect(res1.ok).toBe(true)
    if (res1.ok) {
      expect(res1.remaining).toBe(2)
    }

    const res2 = checkRateLimit(req, key, 3, 60000)
    expect(res2.ok).toBe(true)
    if (res2.ok) {
      expect(res2.remaining).toBe(1)
    }

    const res3 = checkRateLimit(req, key, 3, 60000)
    expect(res3.ok).toBe(true)
    if (res3.ok) {
      expect(res3.remaining).toBe(0)
    }
  })

  it('should block requests exceeding limit and return 429', () => {
    const key = `test-block-${Date.now()}`
    const req = createMockRequest('192.168.1.2')

    // Exhaust limit of 2
    checkRateLimit(req, key, 2, 60000)
    checkRateLimit(req, key, 2, 60000)

    // 3rd attempt should be blocked
    const blocked = checkRateLimit(req, key, 2, 60000)
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) {
      expect(blocked.response.status).toBe(429)
      expect(blocked.response.headers.get('Retry-After')).toBeDefined()
      expect(blocked.response.headers.get('X-RateLimit-Remaining')).toBe('0')
    }
  })

  it('should isolate limits by IP', () => {
    const key = `test-ip-iso-${Date.now()}`
    const reqA = createMockRequest('10.0.0.1')
    const reqB = createMockRequest('10.0.0.2')

    checkRateLimit(reqA, key, 1, 60000)
    const blockedA = checkRateLimit(reqA, key, 1, 60000)
    expect(blockedA.ok).toBe(false)

    // User B should still have quota
    const resB = checkRateLimit(reqB, key, 1, 60000)
    expect(resB.ok).toBe(true)
  })
})
