import { NextRequest, NextResponse } from "next/server"

export const DEVICE_COOKIE_NAME = "nr_device_id"
export const DEVICE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year in seconds

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function getSigningSecret(): string {
  return (
    process.env.DEVICE_SIGNATURE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "nepalreforms-identity-device-secret-v1"
  )
}

/**
 * Pure standard SHA-256 implementation that works synchronously across
 * Node.js, Bun, Edge Runtime, and Browsers without importing 'crypto'.
 */
function sha256Sync(ascii: string): string {
  const mathPow = Math.pow
  const maxWord = mathPow(2, 32)
  let i = 0
  let j = 0
  let result = ""
  const words: number[] = []
  const asciiBitLength = ascii.length * 8

  let hash: number[] = []
  const k: number[] = []
  let primeCounter = 0

  const isPrime = (n: number) => {
    for (let factor = 2; factor * factor <= n; factor++) {
      if (n % factor === 0) return false
    }
    return true
  }

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 1 / 2) * maxWord) | 0
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0
      primeCounter++
    }
  }

  ascii += "\x80"
  while ((ascii.length % 64) - 56) ascii += "\x00"
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i)
    if (j >> 8) return ""
    words[i >> 2] |= j << (((3 - i) % 4) * 8)
  }
  words.push((asciiBitLength / maxWord) | 0)
  words.push(asciiBitLength | 0)

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16))
    const oldHash = hash
    hash = hash.slice(0, 8)

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15]
      const w2 = w[i - 2]

      const a = hash[0]
      const e = hash[4]
      const temp1 =
        hash[7] +
        (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (((w15 >>> 7) | (w15 << 25)) ^ ((w15 >>> 18) | (w15 << 14)) ^ (w15 >>> 3)) +
                w[i - 7] +
                (((w2 >>> 17) | (w2 << 15)) ^ ((w2 >>> 19) | (w2 << 13)) ^ (w2 >>> 10))) |
              0)

      const temp2 =
        (((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]))

      hash = [(temp1 + temp2) | 0, a, hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]]
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255
      result += (b < 16 ? "0" : "") + b.toString(16)
    }
  }
  return result
}

/**
 * Computes standard HMAC-SHA256
 */
function hmacSha256(key: string, message: string): string {
  const blockSize = 64
  let keyBytes: number[] = []

  if (key.length > blockSize) {
    const keyHash = sha256Sync(key)
    for (let i = 0; i < keyHash.length; i += 2) {
      keyBytes.push(parseInt(keyHash.substr(i, 2), 16))
    }
  } else {
    for (let i = 0; i < key.length; i++) {
      keyBytes.push(key.charCodeAt(i) & 0xff)
    }
  }

  while (keyBytes.length < blockSize) {
    keyBytes.push(0)
  }

  let oKeyPad = ""
  let iKeyPad = ""
  for (let i = 0; i < blockSize; i++) {
    oKeyPad += String.fromCharCode(keyBytes[i] ^ 0x5c)
    iKeyPad += String.fromCharCode(keyBytes[i] ^ 0x36)
  }

  const innerHashHex = sha256Sync(iKeyPad + message)
  let innerHashStr = ""
  for (let i = 0; i < innerHashHex.length; i += 2) {
    innerHashStr += String.fromCharCode(parseInt(innerHashHex.substr(i, 2), 16))
  }

  return sha256Sync(oKeyPad + innerHashStr)
}

/**
 * Signs a device UUID with HMAC-SHA256
 */
export function signDeviceId(deviceId: string, secret = getSigningSecret()): string {
  const signature = hmacSha256(secret, deviceId)
  return `${deviceId}.${signature}`
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/**
 * Verifies a signed device ID cookie value. Returns the verified UUID or null if invalid/tampered.
 */
export function verifySignedDeviceId(signedValue: string | null | undefined, secret = getSigningSecret()): string | null {
  if (!signedValue || typeof signedValue !== "string") return null

  const parts = signedValue.split(".")
  if (parts.length !== 2) return null

  const [deviceId, providedSignature] = parts
  if (!UUID_REGEX.test(deviceId)) return null

  const expectedSignature = hmacSha256(secret, deviceId)
  return timingSafeCompare(providedSignature, expectedSignature) ? deviceId : null
}

/**
 * Extracts client IP from request headers
 */
export function extractClientIp(req: { headers: { get(name: string): string | null } }): string {
  const xf = req.headers.get("x-forwarded-for") || ""
  const ip = xf.split(",")[0]?.trim()
  if (ip) return ip
  const xr = req.headers.get("x-real-ip")
  if (xr) return xr
  try {
    return (req as any)?.ip || "127.0.0.1"
  } catch {
    return "127.0.0.1"
  }
}

/**
 * Hashes client fingerprint metadata (IP, UA, client-provided canvas/hardware hash)
 */
export function createDeviceFingerprintHash(
  clientSignature?: string | null,
  userAgent?: string | null,
  ip?: string | null
): string {
  return sha256Sync(`${clientSignature || "none"}|${userAgent || "unknown-agent"}|${ip || "127.0.0.1"}`)
}

export interface DeviceIdentityResult {
  deviceId: string
  isNew: boolean
  signedCookieValue: string
  clientIp: string
  userAgent: string
}

function generateRandomUUID(): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID()
  }
  // RFC4122 v4 fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Extracts existing verified device ID from cookie, or generates a new cryptographically signed device ID.
 */
export function getOrCreateDeviceIdentity(request: NextRequest | Request): DeviceIdentityResult {
  let cookieHeader = ""
  if ("cookies" in request && typeof (request as any).cookies?.get === "function") {
    cookieHeader = (request as NextRequest).cookies.get(DEVICE_COOKIE_NAME)?.value || ""
  } else if ("headers" in request) {
    const rawCookies = request.headers.get("cookie") || ""
    const match = rawCookies.match(new RegExp(`(?:^|;\\s*)${DEVICE_COOKIE_NAME}=([^;]+)`))
    if (match) {
      cookieHeader = decodeURIComponent(match[1])
    }
  }

  const existingDeviceId = verifySignedDeviceId(cookieHeader)
  const clientIp = extractClientIp(request)
  const userAgent = request.headers.get("user-agent") || ""

  if (existingDeviceId) {
    return {
      deviceId: existingDeviceId,
      isNew: false,
      signedCookieValue: cookieHeader,
      clientIp,
      userAgent,
    }
  }

  const newDeviceId = generateRandomUUID()
  const signedCookieValue = signDeviceId(newDeviceId)

  return {
    deviceId: newDeviceId,
    isNew: true,
    signedCookieValue,
    clientIp,
    userAgent,
  }
}

/**
 * Attaches the nr_device_id cookie to a NextResponse
 */
export function attachDeviceCookie<T = any>(response: NextResponse<T>, signedCookieValue: string): NextResponse<T> {
  response.cookies.set({
    name: DEVICE_COOKIE_NAME,
    value: signedCookieValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DEVICE_COOKIE_MAX_AGE,
  })
  return response
}
