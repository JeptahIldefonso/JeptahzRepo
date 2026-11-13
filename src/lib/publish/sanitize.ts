/**
 * Redacts secret credentials, GitHub personal access tokens, and Vercel tokens
 * from error messages or logs to prevent credential leakage.
 */
export function sanitizeError(err: unknown): string {
  if (!err) return "Unknown error";

  let message = err instanceof Error ? err.message : String(err);

  // Redact classic GitHub personal access tokens (ghp_...)
  message = message.replace(/ghp_[a-zA-Z0-9]{20,}/g, "[REDACTED_TOKEN]");

  // Redact fine-grained GitHub personal access tokens (github_pat_...)
  message = message.replace(/github_pat_[a-zA-Z0-9_]{30,}/g, "[REDACTED_TOKEN]");

  // Redact Bearer tokens in headers or logs
  message = message.replace(/Bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi, "Bearer [REDACTED]");

  // Redact configured environment secret values if present
  const tokensToRedact = [
    process.env.GITHUB_TOKEN,
    process.env.VERCEL_TOKEN,
    process.env.ADMIN_SECRET,
  ].filter((t): t is string => Boolean(t && t.length > 5));

  for (const token of tokensToRedact) {
    message = message.split(token).join("[REDACTED_SECRET]");
  }

  return message;
}
