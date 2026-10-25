import { createSessionToken, ADMIN_COOKIE_NAME } from "../src/lib/auth.ts";

process.env.ADMIN_PASSPHRASE = "09355566245";

async function test() {
  console.log("Testing Middleware Protection on http://localhost:3000...");

  // 1. Unauthenticated request to /admin (redirect: 'manual' to check status 307)
  const res1 = await fetch("http://localhost:3000/admin", {
    redirect: "manual",
  });
  console.log("1. Unauthenticated /admin status:", res1.status);
  const location1 = res1.headers.get("location");
  console.log("   Redirect Location:", location1);
  if (res1.status !== 307 && res1.status !== 302 && res1.status !== 308) {
    throw new Error(`Expected redirect status (307/302), got ${res1.status}`);
  }
  if (!location1 || !location1.includes("/login")) {
    throw new Error(`Expected redirect to /login, got ${location1}`);
  }
  console.log("   ✓ Blocked unauthenticated /admin and redirected to login");

  // 2. Unauthenticated mutating API request (POST /api/entries)
  const res2 = await fetch("http://localhost:3000/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Unauthorized Attempt" }),
  });
  console.log("2. Unauthenticated POST /api/entries status:", res2.status);
  const data2 = await res2.json();
  console.log("   Response:", data2);
  if (res2.status !== 401) {
    throw new Error(`Expected 401 Unauthorized for mutating API, got ${res2.status}`);
  }
  console.log("   ✓ Blocked unauthenticated mutating API request with 401");

  // 3. Authenticated request to /admin
  const validToken = await createSessionToken();
  const res3 = await fetch("http://localhost:3000/admin", {
    headers: { Cookie: `${ADMIN_COOKIE_NAME}=${validToken}` },
    redirect: "manual",
  });
  console.log("3. Authenticated /admin status:", res3.status);
  if (res3.status !== 200) {
    throw new Error(`Expected 200 OK for authenticated /admin, got ${res3.status}`);
  }
  console.log("   ✓ Allowed authenticated /admin request with valid session token");

  console.log("\nALL MIDDLEWARE TESTS PASSED SUCCESSFULLY! (3/3)");
}

test().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
