async function test() {
  console.log("Testing Auth API Routes on http://localhost:3000...");

  // 1. Wrong password
  const res1 = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passphrase: "wrong-password" }),
  });
  console.log("1. Wrong password HTTP status:", res1.status);
  const data1 = await res1.json();
  console.log("   Body:", data1);
  if (res1.status !== 401) throw new Error("Expected 401 for wrong password");

  // 2. Correct password
  const res2 = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passphrase: "09355566245" }),
  });
  console.log("2. Correct password HTTP status:", res2.status);
  const data2 = await res2.json();
  console.log("   Body:", data2);
  if (res2.status !== 200) throw new Error("Expected 200 for correct password");

  const setCookie = res2.headers.get("set-cookie");
  console.log("   Set-Cookie:", setCookie);
  if (!setCookie || !setCookie.includes("admin_session=")) {
    throw new Error("Missing admin_session in Set-Cookie header");
  }
  // Check that Max-Age is NOT set (so it is a browser session cookie)
  if (setCookie.toLowerCase().includes("max-age") || setCookie.toLowerCase().includes("expires")) {
    throw new Error("Session cookie should NOT have Max-Age or Expires");
  }
  console.log("   ✓ Verified session cookie has NO Max-Age/Expires (RFC 6265 session lifetime)");

  const cookieVal = setCookie.split(";")[0];

  // 3. Test Session route with cookie
  const res3 = await fetch("http://localhost:3000/api/auth/session", {
    headers: { Cookie: cookieVal },
  });
  const data3 = await res3.json();
  console.log("3. Session check with cookie:", data3);
  if (!data3.authenticated) throw new Error("Expected authenticated: true");

  // 4. Test Session route without cookie
  const res4 = await fetch("http://localhost:3000/api/auth/session");
  const data4 = await res4.json();
  console.log("4. Session check without cookie:", data4);
  if (data4.authenticated) throw new Error("Expected authenticated: false");

  // 5. Test Logout route
  const res5 = await fetch("http://localhost:3000/api/auth/logout", {
    method: "POST",
  });
  const logoutCookie = res5.headers.get("set-cookie");
  console.log("5. Logout status:", res5.status, "Cookie:", logoutCookie);
  if (!logoutCookie || !logoutCookie.toLowerCase().includes("max-age=0")) {
    throw new Error("Expected Max-Age=0 in logout cookie header");
  }

  console.log("\nALL AUTH ROUTE TESTS PASSED SUCCESSFULLY! (5/5)");
}

test().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
