/**
 * Authentication and Session Engine for JeptahzRepo Admin Studio
 * Uses standard Web Crypto API (HMAC-SHA256) compatible with both Node.js & Edge Runtime.
 */

export const ADMIN_COOKIE_NAME = "admin_session";

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
 * Validates whether the supplied passphrase matches the configured admin passphrase.
 */
export function verifyPassphrase(input: string): boolean {
  const secret = getAdminPassphrase();
  if (!secret || !input) return false;

  // Constant-time length and character comparison
  if (input.length !== secret.length) return false;
  let match = 0;
  for (let i = 0; i < input.length; i++) {
    match |= input.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return match === 0;
}

const encoder = new TextEncoder();

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
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
  const secret = getAdminPassphrase() || "jeptahz-admin-fallback-key";
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a signed session token: `${timestamp}.${signature}`
 */
export async function createSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const payload = `jeptahz-admin:${timestamp}`;
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${timestamp}.${bufferToBase64Url(signature)}`;
}

/**
 * Verifies that a session token was signed with the admin passphrase and has a valid format.
 */
export async function verifySessionToken(token: string | null | undefined): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, sigBase64] = parts;
  if (!timestamp || !sigBase64) return false;

  try {
    const payload = `jeptahz-admin:${timestamp}`;
    const key = await getHmacKey();
    const signatureBuffer = base64UrlToBuffer(sigBase64);

    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      encoder.encode(payload)
    );
  } catch {
    return false;
  }
}
