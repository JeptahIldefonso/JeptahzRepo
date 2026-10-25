# Admin Password Protection & Auto-Logout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure the `/admin` studio so only the portfolio owner can access it via a master passphrase, and automatically log out whenever the browser or tab is closed.

**Architecture:** Dual-layer session invalidation combining (1) server-side Next.js Edge middleware verifying an HMAC-SHA256 signed HTTP-only session cookie (with no `Max-Age` / `Expires`, designating RFC 6265 browser session lifetime), and (2) client-side `sessionStorage` lifecycle validation in an admin layout session guard that terminates sessions immediately if the browser tab or window was closed. Mutating API routes (`/api/*`) are also protected with 401 Unauthorized guards.

**Tech Stack:** Next.js 15 (App Router & Edge Middleware), Web Crypto API (HMAC-SHA256), TypeScript, React 19, Tailwind CSS.

**Spec:** Direct user requirement: "i want the admin settings tobe passworded so i can access it alone and automatically logout every close".

## Global Constraints

- **Single Master Passphrase:** Auth is keyed against `ADMIN_PASSPHRASE` (with fallback to `ADMIN_PASSWORD`) defined in `.env.local`.
- **Session-Only Cookie:** The `admin_session` cookie must omit `maxAge` and `expires` so browsers discard it when the browser process exits.
- **Tab-Close Logout:** Client-side `sessionStorage` token ensures that even if a browser restores tabs after restart, a closed tab/window requires re-authentication.
- **No Insecure Bypasses:** The demo resilience bypass button in `/login` must be removed completely.
- **Visual & Editorial Integrity:** Preserve the `#041a24` dark theme, bespoke typography, and polished editorial aesthetic of the studio.

## Review Focus

- Unauthenticated direct GET request to `/admin` or `/admin/anything` redirects to `/login`.
- Unauthenticated POST/PUT/DELETE request to `/api/entries`, `/api/apps`, `/api/changelog`, or `/api/upload` returns 401 Unauthorized.
- Login attempt with invalid passphrase returns 401 and displays clear, elegant error feedback without leaking system details.
- Login attempt with valid passphrase succeeds, sets session cookie, initializes `sessionStorage`, and transitions into `/admin`.
- Visiting `/admin` with valid session cookie but without `sessionStorage` (tab re-opened after closure) triggers automatic logout and redirects to `/login`.

---

### Task 1: Auth Utilities & Signed Token Engine

**Files:**
- Create: `src/lib/auth.ts`
- Test: `src/lib/__tests__/auth.test.ts` (or node verification script `scripts/verify-auth.mjs`)

**Interfaces:**
- Produces:
  - `verifyPassphrase(input: string): boolean`
  - `createSessionToken(): Promise<string>`
  - `verifySessionToken(token: string): Promise<boolean>`
  - `ADMIN_COOKIE_NAME = "admin_session"`

- [ ] **Step 1: Write auth utility with Web Crypto HMAC-SHA256 signature**
Create `src/lib/auth.ts` with:
  - Constant `ADMIN_COOKIE_NAME = "admin_session"`.
  - `getAdminPassphrase(): string` reading `process.env.ADMIN_PASSPHRASE || process.env.ADMIN_PASSWORD || ""`.
  - `verifyPassphrase(input: string): boolean` using timing-safe comparison or exact match against configured passphrase.
  - `createSessionToken(): Promise<string>` creating a payload with timestamp signed using HMAC-SHA256 via Web Crypto (`crypto.subtle`), returning `${timestamp}.${signatureBase64}`.
  - `verifySessionToken(token: string): Promise<boolean>` parsing timestamp, verifying HMAC-SHA256 signature using the admin passphrase as secret key.

- [ ] **Step 2: Create verification script `scripts/verify-auth.mjs`**
Write a standalone Node script testing:
  - Valid token verification passes.
  - Tampered token verification fails.
  - Incorrect passphrase comparison fails.
  - Correct passphrase comparison passes.

- [ ] **Step 3: Run verification script**
Run: `node scripts/verify-auth.mjs`
Expected: Output confirms all assertions pass.

- [ ] **Step 4: Commit**
```bash
git add src/lib/auth.ts scripts/verify-auth.mjs
git commit -m "feat(auth): implement Web Crypto HMAC-SHA256 session token engine"
```

---

### Task 2: Auth Route Handlers (Login, Logout, Session)

**Files:**
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/session/route.ts`

**Interfaces:**
- Consumes: `verifyPassphrase`, `createSessionToken`, `verifySessionToken`, `ADMIN_COOKIE_NAME` from `src/lib/auth.ts`.
- Produces:
  - `POST /api/auth/login` -> sets session cookie without maxAge/expires.
  - `POST /api/auth/logout` -> clears session cookie.
  - `GET /api/auth/session` -> `{ authenticated: boolean }`.

- [ ] **Step 1: Implement `POST /api/auth/login`**
Parse JSON body `{ passphrase }`.
Validate using `verifyPassphrase(passphrase)`. If invalid, return `NextResponse.json({ error: "Invalid passphrase" }, { status: 401 })`.
If valid, generate token with `createSessionToken()`.
Set cookie `admin_session`:
  - `httpOnly: true`
  - `secure: process.env.NODE_ENV === "production"`
  - `sameSite: "lax"`
  - `path: "/"`
  - **NO `maxAge` or `expires`** (Session cookie).
Return `NextResponse.json({ success: true })`.

- [ ] **Step 2: Implement `POST /api/auth/logout`**
Delete cookie `admin_session` by setting `maxAge: 0, path: "/"`.
Return `NextResponse.json({ success: true })`.

- [ ] **Step 3: Implement `GET /api/auth/session`**
Read `admin_session` cookie from request.
Call `verifySessionToken(token)`.
Return `NextResponse.json({ authenticated: isValid })`.

- [ ] **Step 4: Verify via curl / fetch test**
Test `/api/auth/login` with wrong password -> 401.
Test `/api/auth/login` with correct password -> 200 and `set-cookie: admin_session=...`.
Test `/api/auth/logout` -> clears cookie.

- [ ] **Step 5: Commit**
```bash
git add src/app/api/auth/
git commit -m "feat(auth): add login, logout, and session API routes"
```

---

### Task 3: Edge Middleware & API Guard

**Files:**
- Create: `src/middleware.ts`

**Interfaces:**
- Consumes: `verifySessionToken`, `ADMIN_COOKIE_NAME` from `src/lib/auth.ts`.
- Protects:
  - Any path matching `/admin` or `/admin/:path*`
  - Any mutating path under `/api/*` (POST, PUT, DELETE, PATCH) except `/api/auth/*`

- [ ] **Step 1: Create `src/middleware.ts`**
Define Next.js middleware with matcher config:
  - Matcher: `["/admin/:path*", "/api/entries/:path*", "/api/apps/:path*", "/api/changelog/:path*", "/api/changelog-banner/:path*", "/api/upload/:path*"]`.
For `/admin` paths:
  - Read `admin_session` cookie.
  - Verify with `verifySessionToken`.
  - If invalid or missing, redirect to `/login?from=${encodeURIComponent(req.nextUrl.pathname)}`.
For mutating `/api/*` paths (methods `POST`, `PUT`, `DELETE`, `PATCH`):
  - Check `admin_session`.
  - If invalid or missing, return `NextResponse.json({ error: "Unauthorized" }, { status: 401 })`.
  - For `GET` requests, allow through so public archive data remains accessible.

- [ ] **Step 2: Verify middleware in dev server**
Request `/admin` without cookie -> expect redirect (307) to `/login`.
Send POST to `/api/entries` without cookie -> expect 401.

- [ ] **Step 3: Commit**
```bash
git add src/middleware.ts
git commit -m "feat(security): enforce Edge middleware protection for admin routes and mutating APIs"
```

---

### Task 4: Admin Studio Session Guard & Invalidation on Tab Close

**Files:**
- Create: `src/components/admin/admin-session-guard.tsx`
- Modify: `src/app/(admin)/admin/layout.tsx`

**Interfaces:**
- Produces: `<AdminSessionGuard />` component handling `sessionStorage` tab-close invalidation and idle logout.

- [ ] **Step 1: Implement `AdminSessionGuard`**
Create client component `src/components/admin/admin-session-guard.tsx`:
  - On mount (`useEffect`):
    - Check `sessionStorage.getItem("jeptahz_admin_session")`.
    - If null or not `"active"`:
      - Trigger logout: call `fetch("/api/auth/logout", { method: "POST" })`.
      - Redirect immediately: `window.location.href = "/login?reason=session_ended"`.
    - If active: attach `window.addEventListener("storage", ...)` to detect cross-tab logouts.
  - Provide an exportable `logoutAdmin()` helper that clears `sessionStorage` and calls `/api/auth/logout`.

- [ ] **Step 2: Update `src/app/(admin)/admin/layout.tsx`**
Mount `<AdminSessionGuard />` inside the layout.
Replace the static `href="/login"` exit link with an interactive "Exit / Lock Studio" button using the `logoutAdmin()` handler.

- [ ] **Step 3: Verify tab-close behavior**
Simulate tab reopening without `sessionStorage` -> verify automatic redirect to `/login`.

- [ ] **Step 4: Commit**
```bash
git add src/components/admin/admin-session-guard.tsx src/app/(admin)/admin/layout.tsx
git commit -m "feat(admin): add tab-close session guard and studio lock button"
```

---

### Task 5: Redesign Login Page Surface

**Files:**
- Modify: `src/app/(admin)/login/page.tsx`
- Modify: `.env.example`
- Modify: `.env.local`

**Interfaces:**
- Provides: Private Master Passphrase gateway with editorial styling, error feedback, show/hide password, and direct `sessionStorage` initialization.

- [ ] **Step 1: Configure `ADMIN_PASSPHRASE` in `.env.local` and `.env.example`**
Add `ADMIN_PASSPHRASE` in `.env.local` (defaulting to a secure user-provided or generated passkey) and document in `.env.example`.

- [ ] **Step 2: Refactor `src/app/(admin)/login/page.tsx`**
  - Remove demo bypass button ("Enter Studio (Resilience Mode)").
  - Streamline the form to require the Master Passphrase.
  - Implement form submission calling `/api/auth/login`.
  - On 200 OK:
    - Set `sessionStorage.setItem("jeptahz_admin_session", "active")`.
    - Redirect to `/admin` (or `searchParams.get("from") || "/admin"`).
  - On error: display error banner styled with editorial monochrome palette.
  - Add password visibility toggle (Eye/EyeOff icon).
  - Add query param alert if `reason === "session_ended"` ("Session ended because browser/tab was closed").

- [ ] **Step 3: Verify login workflow**
Test wrong password -> shows error.
Test correct password -> logs in, sets cookie + `sessionStorage`, redirects to `/admin`.

- [ ] **Step 4: Commit**
```bash
git add src/app/(admin)/login/page.tsx .env.example
git commit -m "feat(login): modernize admin gateway with passphrase authentication and auto-logout feedback"
```

---

### Task 6: End-to-End Verification & TypeScript Check

**Files:**
- All touched files

- [ ] **Step 1: Run TypeScript validation**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Run End-to-End Test Script**
Run an automated verification script that executes:
  1. GET `/admin` without credentials -> redirected to `/login`.
  2. POST `/api/auth/login` with bad password -> 401.
  3. POST `/api/auth/login` with correct passphrase -> 200 + `admin_session` cookie.
  4. GET `/admin` with cookie -> 200.
  5. POST `/api/auth/logout` -> clears cookie.
  6. Subsequent GET `/admin` -> redirected to `/login`.

- [ ] **Step 3: Clean up temporary test scripts**
Remove temporary test scripts from root.

- [ ] **Step 4: Final Git Push**
```bash
git push origin main
```
