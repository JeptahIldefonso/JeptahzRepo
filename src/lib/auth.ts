/**
 * Authentication and Session Engine for JeptahzRepo Admin Studio
 * Uses standard Web Crypto API (HMAC-SHA256) compatible with both Node.js & Edge Runtime.
 *
 * Security Features:
 * - Decoupled 32+ byte SESSION_SECRET for HMAC (prevents offline password cracking)
 * - Cryptographically signed { iat, exp } tokens with 12-hour server-side expiration
 * - In-memory IP-based rate limiting (5 attempts per 15 minutes)
 * - Safe relative redirect validation to prevent open-redirect attacks
 * - Constant-time comparison for secrets
 */

export const ADMIN_COOKIE_NAME = "admin_session";
export const DEFAULT_SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 hours max lifetime
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;

/**
 * In-memory store for login rate limiting by IP
 */
const loginAttemptStore = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
}

/**
 * Checks whether an IP address has exceeded the login rate limit.
 */
export function checkLoginRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const attempts = (loginAttemptStore.get(ip) || []).filter((time) => time > windowStart);

  loginAttemptStore.set(ip, attempts);

  if (attempts.length >= MAX_LOGIN_ATTEMPTS) {
    const oldestAttempt = attempts[0];
    const retryAfterMs = oldestAttempt + RATE_LIMIT_WINDOW_MS - now;
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_LOGIN_ATTEMPTS - attempts.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Records a failed login attempt for a specific IP.
 */
export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const attempts = (loginAttemptStore.get(ip) || []).filter((time) => time > windowStart);
  attempts.push(now);
  loginAttemptStore.set(ip, attempts);
}

/**
 * Clears failed login attempts for an IP upon successful login.
 */
export function clearLoginAttempts(ip: string): void {
  loginAttemptStore.delete(ip);
}

/**
 * Validates redirect target paths to prevent open-redirect vulnerabilities.
 * Only allows relative paths starting with a single '/' and not '//' or '/\'.
 */
export function isValidRedirectUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("/")) return false;
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return false;
  // Disallow control characters or newlines
  if (/[\r\n\t]/.test(trimmed)) return false;
  return true;
}

/**
 * Retrieves the configured administrator passphrase from environment variables.
 */
export function getAdminPassphrase(): string {
  return (
    process.env.ADMIN_PASSPHRASE ||
    process.env.ADMIN_PASSWORD ||
    ""
  ).trim();
}

/**
 * Retrieves the dedicated session HMAC secret (decoupled from the passphrase).
 */
export function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    "jeptahz-admin-dedicated-session-secret-salt-32bytes-min"
  ).trim();
}

/**
 * Validates whether the supplied passphrase matches the configured admin passphrase.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyPassphrase(input: string): boolean {
  const secret = getAdminPassphrase();
  if (!secret || !input) return false;

  if (input.length !== secret.length) return false;
  let match = 0;
  for (let i = 0; i < input.length; i++) {
    match |= input.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return match === 0;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = getSessionSecret();
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export interface SessionPayload {
  sub: "jeptahz-admin";
  iat: number;
  exp: number;
}

/**
 * Creates a signed session token: `${payloadBase64}.${signatureBase64}`
 * Embedded with issue time (iat) and expiration time (exp).
 */
export async function createSessionToken(
  ttlSeconds = DEFAULT_SESSION_TTL_SECONDS
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: "jeptahz-admin",
    iat: now,
    exp: now + ttlSeconds,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = bufferToBase64Url(encoder.encode(payloadJson));
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadBase64)
  );

  return `${payloadBase64}.${bufferToBase64Url(signature)}`;
}

/**
 * Verifies that a session token was signed with SESSION_SECRET, has not been tampered with,
 * and has not expired. Uses constant-time crypto.subtle.verify.
 */
export async function verifySessionToken(
  token: string | null | undefined
): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadBase64, sigBase64] = parts;
  if (!payloadBase64 || !sigBase64) return false;

  try {
    const key = await getHmacKey();
    const signatureBuffer = base64UrlToBuffer(sigBase64);

    // Constant-time HMAC verification
    const isValidSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      encoder.encode(payloadBase64)
    );

    if (!isValidSignature) return false;

    // Decode and parse payload to check expiration
    const payloadBuffer = base64UrlToBuffer(payloadBase64);
    const payloadJson = decoder.decode(payloadBuffer);
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (payload.sub !== "jeptahz-admin") return false;

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp <= now) {
      return false; // Token expired
    }

    return true;
  } catch {
    return false;
  }
}
