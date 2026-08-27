import { describe, it, expect } from "bun:test"
import {
  signDeviceId,
  verifySignedDeviceId,
  getOrCreateDeviceIdentity,
  attachDeviceCookie,
  createDeviceFingerprintHash,
  DEVICE_COOKIE_NAME,
} from "@/lib/security/device-identity"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { NextResponse } from "next/server"

describe("Device Signature & Cookie Identity", () => {
  const testSecret = "nepalreforms-test-secret-123"
  const sampleUuid = "12345678-1234-4234-8234-123456789abc"

  it("should sign and successfully verify a valid device UUID", () => {
    const signed = signDeviceId(sampleUuid, testSecret)
    expect(signed).toContain(".")
    expect(signed.startsWith(sampleUuid)).toBe(true)

    const verified = verifySignedDeviceId(signed, testSecret)
    expect(verified).toBe(sampleUuid)
  })

  it("should reject tampered or forged signed cookies", () => {
    const signed = signDeviceId(sampleUuid, testSecret)
    
    // Tamper with UUID
    const tamperedUuid = signed.replace("12345678", "87654321")
    expect(verifySignedDeviceId(tamperedUuid, testSecret)).toBeNull()

    // Tamper with signature
    const tamperedSig = signed.slice(0, -4) + "abcd"
    expect(verifySignedDeviceId(tamperedSig, testSecret)).toBeNull()

    // Invalid format
    expect(verifySignedDeviceId("invalid-string", testSecret)).toBeNull()
    expect(verifySignedDeviceId("", testSecret)).toBeNull()
    expect(verifySignedDeviceId(null, testSecret)).toBeNull()
    expect(verifySignedDeviceId(undefined, testSecret)).toBeNull()
  })

  it("should generate a new signed device identity when no cookie is present", () => {
    const req = new Request("http://localhost:3000/api/agendas/item-1/vote", {
      headers: {
        "user-agent": "Mozilla/5.0 NepalReforms-Test",
        "x-forwarded-for": "202.70.80.90",
      },
    })

    const identity = getOrCreateDeviceIdentity(req)
    expect(identity.isNew).toBe(true)
    expect(identity.deviceId).toBeDefined()
    expect(identity.signedCookieValue).toBeDefined()
    expect(identity.clientIp).toBe("202.70.80.90")
    expect(identity.userAgent).toBe("Mozilla/5.0 NepalReforms-Test")

    // The generated cookie value should verify successfully
    const verified = verifySignedDeviceId(identity.signedCookieValue)
    expect(verified).toBe(identity.deviceId)
  })

  it("should recognize and verify an existing signed cookie in request headers", () => {
    const signed = signDeviceId(sampleUuid)
    const req = new Request("http://localhost:3000/api/agendas/item-1/vote", {
      headers: {
        cookie: `${DEVICE_COOKIE_NAME}=${signed}; other_cookie=xyz`,
      },
    })

    const identity = getOrCreateDeviceIdentity(req)
    expect(identity.isNew).toBe(false)
    expect(identity.deviceId).toBe(sampleUuid)
  })

  it("should attach device cookie to NextResponse with security flags", () => {
    const signed = signDeviceId(sampleUuid)
    const initialResponse = NextResponse.json({ success: true })
    const responseWithCookie = attachDeviceCookie(initialResponse, signed)

    const cookie = responseWithCookie.cookies.get(DEVICE_COOKIE_NAME)
    expect(cookie).toBeDefined()
    expect(cookie?.value).toBe(signed)
    expect(cookie?.httpOnly).toBe(true)
    expect(cookie?.path).toBe("/")
    expect(cookie?.sameSite).toBe("lax")
  })

  it("should generate deterministic fingerprint hash from client metadata", () => {
    const hash1 = createDeviceFingerprintHash("canvas-hash-1", "ua-string", "192.168.1.50")
    const hash2 = createDeviceFingerprintHash("canvas-hash-1", "ua-string", "192.168.1.50")
    const hash3 = createDeviceFingerprintHash("canvas-hash-2", "ua-string", "192.168.1.50")

    expect(hash1).toBe(hash2)
    expect(hash1).not.toBe(hash3)
  })

  it("should isolate rate limits by custom device ID", () => {
    const key = `test-device-iso-${Date.now()}`
    const req = new Request("http://localhost:3000/api/vote", {
      headers: { "x-forwarded-for": "10.0.0.1" },
    })

    const deviceA = "device-uuid-aaaa-1111"
    const deviceB = "device-uuid-bbbb-2222"

    // Exhaust device A
    const resA1 = checkRateLimit(req, key, 1, 60000, deviceA)
    expect(resA1.ok).toBe(true)

    const resA2 = checkRateLimit(req, key, 1, 60000, deviceA)
    expect(resA2.ok).toBe(false)

    // Device B should still be allowed even from same IP
    const resB = checkRateLimit(req, key, 1, 60000, deviceB)
    expect(resB.ok).toBe(true)
  })
})
