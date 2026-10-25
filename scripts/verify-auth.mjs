import {
  verifyPassphrase,
  createSessionToken,
  verifySessionToken,
  ADMIN_COOKIE_NAME,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginAttempts,
  isValidRedirectUrl,
} from "../src/lib/auth.ts";

async function runTests() {
  console.log("Running Enhanced Auth Engine Security Tests...");

  // 1. Constant check
  if (ADMIN_COOKIE_NAME !== "admin_session") {
    throw new Error(`Expected ADMIN_COOKIE_NAME to be 'admin_session', got ${ADMIN_COOKIE_NAME}`);
  }
  console.log("✓ ADMIN_COOKIE_NAME is 'admin_session'");

  // 2. Passphrase verification
  process.env.ADMIN_PASSPHRASE = "test-secret-123";
  if (!verifyPassphrase("test-secret-123")) {
    throw new Error("verifyPassphrase failed for matching password");
  }
  if (verifyPassphrase("wrong-password")) {
    throw new Error("verifyPassphrase unexpectedly passed for wrong password");
  }
  console.log("✓ verifyPassphrase correctly validates and rejects input");

  // 3. Token format with { iat, exp }
  const token = await createSessionToken();
  const isValid = await verifySessionToken(token);
  if (!isValid) {
    throw new Error("verifySessionToken failed for freshly generated token");
  }
  console.log("✓ createSessionToken generated valid expiring token");

  // 4. Expired token rejection
  const expiredToken = await createSessionToken(-10); // Expired 10 seconds ago
  const isExpiredValid = await verifySessionToken(expiredToken);
  if (isExpiredValid) {
    throw new Error("verifySessionToken accepted an expired token!");
  }
  console.log("✓ verifySessionToken strictly rejected expired token");

  // 5. Tampered token rejection
  const [payloadBase64, sig] = token.split(".");
  const tamperedSig = sig.slice(0, -4) + "XXXX";
  const tamperedToken = `${payloadBase64}.${tamperedSig}`;
  if (await verifySessionToken(tamperedToken)) {
    throw new Error("verifySessionToken accepted a tampered signature!");
  }
  console.log("✓ verifySessionToken rejected tampered signature");

  // 6. Rate limiter
  const testIp = "192.168.1.100";
  clearLoginAttempts(testIp);
  for (let i = 0; i < 5; i++) {
    const check = checkLoginRateLimit(testIp);
    if (!check.allowed) throw new Error(`Attempt ${i} should be allowed`);
    recordFailedLogin(testIp);
  }
  const blockedCheck = checkLoginRateLimit(testIp);
  if (blockedCheck.allowed) {
    throw new Error("Rate limiter failed to block after 5 failed attempts!");
  }
  console.log("✓ Rate limiter successfully blocked after 5 failed attempts (retry after:", blockedCheck.retryAfterSeconds, "s)");

  clearLoginAttempts(testIp);
  const resetCheck = checkLoginRateLimit(testIp);
  if (!resetCheck.allowed) {
    throw new Error("clearLoginAttempts failed to reset");
  }
  console.log("✓ Rate limiter reset succeeded on login");

  // 7. Safe Redirect URL
  if (!isValidRedirectUrl("/admin")) throw new Error("Expected /admin to be valid");
  if (!isValidRedirectUrl("/admin/curation?tab=entries")) throw new Error("Expected query path to be valid");
  if (isValidRedirectUrl("//evil.com")) throw new Error("Accepted open redirect //evil.com");
  if (isValidRedirectUrl("https://evil.com")) throw new Error("Accepted external URL");
  if (isValidRedirectUrl("/\\evil.com")) throw new Error("Accepted malformed path /\\evil.com");
  if (isValidRedirectUrl("javascript:alert(1)")) throw new Error("Accepted javascript: URI");
  console.log("✓ Safe redirect validator blocked open redirects and allowed valid relative paths");

  console.log("\nALL 7 ENHANCED AUTH TESTS PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
