// Standalone test script for auth engine
import { verifyPassphrase, createSessionToken, verifySessionToken, ADMIN_COOKIE_NAME } from "../src/lib/auth.ts";

async function runTests() {
  console.log("Running Auth Engine Tests...");

  // Test 1: Constant check
  if (ADMIN_COOKIE_NAME !== "admin_session") {
    throw new Error(`Expected ADMIN_COOKIE_NAME to be 'admin_session', got ${ADMIN_COOKIE_NAME}`);
  }
  console.log("✓ ADMIN_COOKIE_NAME is 'admin_session'");

  // Test 2: Passphrase verification
  process.env.ADMIN_PASSPHRASE = "test-secret-123";
  if (!verifyPassphrase("test-secret-123")) {
    throw new Error("verifyPassphrase failed for matching password");
  }
  if (verifyPassphrase("wrong-password")) {
    throw new Error("verifyPassphrase unexpectedly passed for wrong password");
  }
  if (verifyPassphrase("")) {
    throw new Error("verifyPassphrase unexpectedly passed for empty string");
  }
  console.log("✓ verifyPassphrase correctly validates and rejects input");

  // Test 3: Session token creation and verification
  const token = await createSessionToken();
  if (!token || typeof token !== "string" || !token.includes(".")) {
    throw new Error(`Invalid token format: ${token}`);
  }
  console.log("✓ createSessionToken generated format:", token);

  const isValid = await verifySessionToken(token);
  if (!isValid) {
    throw new Error("verifySessionToken failed for freshly generated token");
  }
  console.log("✓ verifySessionToken verified valid token");

  // Test 4: Tampered token rejection
  const [timestamp, sig] = token.split(".");
  const tamperedSig = sig.slice(0, -4) + "XXXX";
  const tamperedToken = `${timestamp}.${tamperedSig}`;
  const isTamperedValid = await verifySessionToken(tamperedToken);
  if (isTamperedValid) {
    throw new Error("verifySessionToken accepted a tampered signature!");
  }
  console.log("✓ verifySessionToken rejected tampered signature");

  // Test 5: Empty / malformed tokens
  if (await verifySessionToken("")) {
    throw new Error("Accepted empty token");
  }
  if (await verifySessionToken("malformed-token-without-dot")) {
    throw new Error("Accepted malformed token");
  }
  console.log("✓ verifySessionToken rejected malformed tokens");

  console.log("\nALL AUTH TESTS PASSED SUCCESSFULLY! (5/5)");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
