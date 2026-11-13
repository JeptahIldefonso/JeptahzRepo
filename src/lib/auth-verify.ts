/**
 * Server-side administrator credential verification.
 * Runs in Node.js runtime (not Edge Runtime).
 *
 * Supports:
 * 1. ADMIN_PASSWORD_HASH (OWASP Argon2id hash)
 * 2. ADMIN_PASSPHRASE / ADMIN_PASSWORD (constant-time plaintext comparison)
 */

function getAdminPassphrase(): string {
  return (
    process.env.ADMIN_PASSPHRASE ||
    process.env.ADMIN_PASSWORD ||
    ""
  ).trim();
}

/**
 * Validates whether the supplied passphrase matches the configured admin passphrase or hash.
 */
export async function verifyPassphrase(input: string): Promise<boolean> {
  if (!input) return false;

  // 1. Verify against ADMIN_PASSWORD_HASH if configured
  const hashStr = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (hashStr) {
    const unescapedHash = hashStr.replace(/\\(\$)/g, "$1");
    if (unescapedHash.startsWith("$argon2")) {
      try {
        const { verify } = await import("@node-rs/argon2");
        const isValid = await verify(unescapedHash, input);
        if (isValid) return true;
      } catch (err) {
        console.warn("[auth] Argon2 verification failed:", err);
      }
    }
  }

  // 2. Fallback to ADMIN_PASSPHRASE or ADMIN_PASSWORD
  const secret = getAdminPassphrase();
  if (!secret) return false;

  if (input.length !== secret.length) return false;
  let match = 0;
  for (let i = 0; i < input.length; i++) {
    match |= input.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return match === 0;
}
