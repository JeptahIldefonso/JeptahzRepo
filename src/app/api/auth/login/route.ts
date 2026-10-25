import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassphrase,
  createSessionToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: "Invalid master passphrase" },
        { status: 401 }
      );
    }

    const token = await createSessionToken();

    const response = NextResponse.json({
      success: true,
      message: "Studio access authorized",
    });

    // Set Session-only cookie (RFC 6265: no Max-Age or Expires means browser session lifetime)
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
