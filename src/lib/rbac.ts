import "server-only";
import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

const rank = {
  viewer: 0,
  editor: 1,
  superadmin: 2,
} as const;

export type Role = keyof typeof rank;

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
}

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export class AuthError extends Error {
  constructor(
    public code: "UNAUTHENTICATED" | "FORBIDDEN",
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Server-side RBAC verification (Blueprint Section 9.3)
 * Guarantees that every page, server action, and API route verifies the session.
 */
export async function requireRole(min: Role = "viewer"): Promise<SessionUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    throw new AuthError("UNAUTHENTICATED", "Authentication required. Please sign in.");
  }

  const isValid = await verifySessionToken(token);
  if (!isValid) {
    throw new AuthError("UNAUTHENTICATED", "Session expired or invalid. Please sign in again.");
  }

  // Single admin master session carries 'superadmin' privileges
  const user: SessionUser = {
    id: "admin-master",
    email: process.env.ADMIN_EMAIL || "admin@jeptahz.local",
    role: "superadmin",
  };

  if (rank[user.role] < rank[min]) {
    throw new AuthError("FORBIDDEN", "You do not have permission to perform this action.");
  }

  return user;
}

/**
 * Server Action Uniform Execution Wrapper (Blueprint Section 9.3 & 10.1)
 */
export async function run<T>(
  min: Role,
  fn: (user: SessionUser) => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  try {
    const user = await requireRole(min);
    return await fn(user);
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: err.message };
    }
    console.error("[rbac_action_error]", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Something went wrong. Please try again.",
    };
  }
}
