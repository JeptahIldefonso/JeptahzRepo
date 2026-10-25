import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isValid = await verifySessionToken(token);

  // 1. Guard Admin Surface (/admin and sub-routes)
  if (pathname.startsWith("/admin")) {
    if (!isValid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Guard Mutating API endpoints (POST, PUT, DELETE, PATCH)
  if (pathname.startsWith("/api/")) {
    const isMutatingMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(
      request.method.toUpperCase()
    );

    // Skip auth check for auth routes themselves (/api/auth/*)
    if (pathname.startsWith("/api/auth/")) {
      return NextResponse.next();
    }

    if (isMutatingMethod && !isValid) {
      return NextResponse.json(
        {
          error: "Unauthorized: Administrator authentication required",
          code: "ADMIN_AUTH_REQUIRED",
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/entries/:path*",
    "/api/apps/:path*",
    "/api/changelog/:path*",
    "/api/changelog-banner/:path*",
    "/api/upload/:path*",
  ],
};
