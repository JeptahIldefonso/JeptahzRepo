import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassphrase,
  createSessionToken,
  ADMIN_COOKIE_NAME,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginAttempts,
} from "@/lib/auth";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  // 1. Enforce Rate Limiting (5 attempts per 15 mins per IP)
  const rateLimit = checkLoginRateLimit(clientIp);
  if (!rateLimit.allowed) {
    console.warn(`[AUTH_BLOCKED] Rate limit exceeded for IP: ${clientIp}`);
    return NextResponse.json(
      {
        error: `Too many failed login attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
        retryAfter: rateLimit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": rateLimit.retryAfterSeconds.toString(),
        },
      }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { passphrase } = body;

    if (!passphrase || typeof passphrase !== "string") {
      return NextResponse.json(
        { error: "Passphrase is required" },
        { status: 400 }
      );
    }

    const isValid = verifyPassphrase(passphrase.trim());

    if (!isValid) {
      // Record failed attempt for rate limiting
      recordFailedLogin(clientIp);

      // Log attempt without exposing any user secrets
      console.warn(
        `[AUTH_FAIL] Failed admin login attempt from IP: ${clientIp} at ${new Date().toISOString()}`
      );

      // Small artificial delay (500ms) to deter fast brute-forcing
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedLimit = checkLoginRateLimit(clientIp);
      return NextResponse.json(
        {
          error: "Invalid master passphrase",
          remainingAttempts: updatedLimit.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Passphrase is valid: reset rate-limit tracking for this IP
    clearLoginAttempts(clientIp);

    const token = await createSessionToken();

    const response = NextResponse.json({
      success: true,
      message: "Studio access authorized",
    });

    // Session Cookie: HttpOnly, SameSite=Lax, Secure in production, no Max-Age/Expires
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: "Authentication service error" },
      { status: 500 }
    );
  }
}
