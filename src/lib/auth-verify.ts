import crypto from "crypto";

function constantTimeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let match = 0;
  for (let i = 0; i < a.length; i++) {
    match |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return match === 0;
}

/**
 * Validates whether the supplied passphrase matches the configured admin passphrase or hash.
 * 
 * Supports:
 * 1. Argon2id hash ($argon2id... or \$argon2id...)
 * 2. SHA-256 hash (64 hex characters)
 * 3. Plain password match (if entered directly in ADMIN_PASSWORD_HASH or ADMIN_PASSPHRASE)
 * 4. Automatic stripping of surrounding quotes and escapes
 */
export async function verifyPassphrase(input: string): Promise<boolean> {
  if (!input) return false;

  const rawHash = (process.env.ADMIN_PASSWORD_HASH || "").trim();
  const rawPassphrase = (process.env.ADMIN_PASSPHRASE || process.env.ADMIN_PASSWORD || "").trim();

  // Strip accidental surrounding quotes ("..." or '...')
  const cleanHash = rawHash.replace(/^["']|["']$/g, "").trim();
  const cleanPassphrase = rawPassphrase.replace(/^["']|["']$/g, "").trim();

  // 1. Check against ADMIN_PASSWORD_HASH
  if (cleanHash) {
    const unescaped = cleanHash.replace(/\\(\$)/g, "$1");

    // Case 1a: Argon2 hash
    if (unescaped.startsWith("$argon2")) {
      try {
        const { verify } = await import("@node-rs/argon2");
        const isValid = await verify(unescaped, input);
        if (isValid) return true;
        console.warn("[auth] Argon2 hash check failed: password did not match.");
      } catch (err) {
        console.error("[auth] Argon2 runtime verification exception:", err);
      }
    }

    // Case 1b: 64-char SHA-256 hex digest
    if (/^[0-9a-f]{64}$/i.test(cleanHash)) {
      const computedSha = crypto.createHash("sha256").update(input, "utf8").digest("hex");
      if (constantTimeCompare(computedSha.toLowerCase(), cleanHash.toLowerCase())) {
        return true;
      }
    }

    // Case 1c: Plain text password stored directly in ADMIN_PASSWORD_HASH
    if (constantTimeCompare(input, cleanHash) || constantTimeCompare(input, unescaped)) {
      return true;
    }
  }

  // 2. Fallback to ADMIN_PASSPHRASE / ADMIN_PASSWORD
  if (cleanPassphrase) {
    if (constantTimeCompare(input, cleanPassphrase)) {
      return true;
    }
  }

  console.warn(
    `[auth] Login failed. Configured sources: ADMIN_PASSWORD_HASH=${Boolean(cleanHash)} (prefix: ${cleanHash.slice(0, 10)}), ADMIN_PASSPHRASE=${Boolean(cleanPassphrase)}. Input length: ${input.length}`
  );

  return false;
}
