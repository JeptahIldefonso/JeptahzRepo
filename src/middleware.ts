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
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
      return redirectResponse;
    }
  }

  // 2. Default-Deny on All Mutating API Endpoints (POST, PUT, DELETE, PATCH)
  if (pathname.startsWith("/api/")) {
    const isMutatingMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(
      request.method.toUpperCase()
    );

    // Skip auth check only for public auth entry points:
    const isPublicAuthRoute = pathname === "/api/auth/login";

    if (isMutatingMethod && !isPublicAuthRoute) {
      // CSRF Protection: Check Origin header for browser requests
      const origin = request.headers.get("origin");
      if (origin) {
        const expectedOrigin = request.nextUrl.origin;
        if (origin !== expectedOrigin) {
          return NextResponse.json(
            { error: "Forbidden: Cross-site request rejected", code: "CSRF_DETECTED" },
            { status: 403 }
          );
        }
      }

      if (!isValid) {
        return NextResponse.json(
          {
            error: "Unauthorized: Administrator authentication required",
            code: "ADMIN_AUTH_REQUIRED",
          },
          { status: 401 }
        );
      }
    }
  }

  const response = NextResponse.next();

  // 3. Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Prevent search engine indexing of private admin and login routes
  if (pathname.startsWith("/admin") || pathname === "/login") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  // Capture /admin, /login, and all /api routes while excluding static assets
  matcher: [
    "/admin/:path*",
    "/login",
    "/api/:path*",
  ],
};
