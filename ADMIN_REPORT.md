# Universal Admin Panel & Publishing Engine: Implementation Report

> **Project:** JeptahzRepo  
> **Blueprint Version:** 2.0.0  
> **Backend Architecture:** Google Cloud Firestore · Firebase Storage · Supabase PostgreSQL · Next.js 15 (App Router) · Vercel  
> **Date:** November 13, 2026  

---

## 1. Executive Summary

In accordance with the **Universal Admin Panel Blueprint (v2.0.0)**, the full database-backed admin studio, content contract read layer, live Git-backed snapshot publisher, Vercel CI/CD deployment poller, and visitor inquiry triage system have been implemented and verified in `JeptahzRepo`.

All 19 test suites pass (`npm test`), TypeScript verification compiles with zero errors (`npm run typecheck`), and the production build compiles all 32 static and dynamic routes cleanly (`npm run build`).

---

## 2. What Was Built

### A. Universal Content Contract & Read Layer (`src/lib/content/`)
* **Strict Zod Contract (`src/lib/content/schema.ts`)**: Defines `siteContentSchema`, `appPublicSchema`, `entryPublicSchema`, `topicPublicSchema`, `changelogItemPublicSchema`, and `siteSettingsPublicSchema`. Strips internal notes and draft items from the public contract.
* **Single Canonical Builder (`src/lib/content/build.ts`)**: `buildContentFromDb()` pulls raw database documents (apps, published entries, topics, site settings, changelog items) from Firestore / PostgreSQL, filters unpublished drafts, and validates the output against `siteContentSchema`.
* **Universal Mode Switch (`src/lib/content/index.ts`)**: Implements `getContent()` which dynamically switches behavior based on the `CONTENT_MODE` environment variable:
  * `static`: Loads the canonical pre-rendered JSON snapshot from disk (`SNAPSHOT_PATH` or `src/db/seeds/mock-archive.json`).
  * `staged`: Returns cached snapshots from ready deployments.
  * `live`: Directly executes `buildContentFromDb()` with Next.js ISR caching (`unstable_cache` tagged with `'content'`).
  * Provides selectors: `getPublicApps()`, `getPublicApp(slug)`, `getPublicEntries()`, `getPublicEntry(slug)`, `getPublicTopics()`, `getPublicSiteSettings()`, `getPublicChangelog()`.

### B. Server-First Security & Role-Based Access Control (`src/lib/rbac.ts`)
* **Role Hierarchy**: `viewer` (0) < `editor` (1) < `superadmin` (2).
* **Guaranteed Server Verification**: `requireRole(min)` verifies cryptographically signed HMAC-SHA256 session tokens from the `admin_session` cookie; throws structured `AuthError` on unauthenticated or unauthorized attempts.
* **Uniform Action Wrapper (`run<T>`)**: Wraps server actions and API handlers, returning standardized `ActionResult<T>` (`{ ok: true, data } | { ok: false, error, fieldErrors }`).
* **Route Protection (`src/middleware.ts`)**: Default-deny for `/admin/:path*` and mutating `/api/*` endpoints with CSRF origin checks. Allows public access strictly to `/api/auth/login` and `/api/contact`.

### C. Live Publishing & One-Click Revert System (`src/lib/publish/`)
* **Snapshot Concurrency Lock (`publish-service.ts`)**: Prevents race conditions with atomic in-memory server locking and automatic 10-minute stale lock expiration.
* **Deterministic Content Hashing (`src/lib/publish/hash.ts`)**: Recursive key-sorting and canonical JSON serialization generating 12-character SHA-256 digests.
* **GitHub Contents API Commits (`src/lib/publish/github.ts`)**: Commits the validated snapshot to branch `main` at `src/db/seeds/mock-archive.json` via GitHub REST API, automatically triggering Vercel CI/CD.
* **Vercel Deployments Polling (`src/lib/publish/vercel.ts`)**: Matches commit SHAs case-insensitively across deployment metadata, transitioning states from `QUEUED` → `BUILDING` → `READY` | `ERROR`.
* **One-Click Forward Revert (`executeRevert`)**: Fetches the previous snapshot from commit history and creates a new forward commit, preserving Git linear history without force-pushing.
* **Publish Panel UI (`src/components/admin/publish-panel.tsx`)**: Client dashboard on `/admin` with live status badges ("Live and up to date", "Unpublished changes", "Publishing…"), monospace hash chips, confirmation modals, error toasts, and 3-second polling.

### D. Inquiries & Contact Portal (`src/app/api/contact/`, `src/components/admin/inquiries-panel.tsx`)
* **Public Rate-Limiting (`src/lib/rate-limit.ts`)**: Sliding window rate-limiter allowing a maximum of 5 inquiries per hour per IP.
* **Anti-Bot Honeypot (`src/lib/validators/inquiry.ts`)**: Invisible `website` field catches automated spam bots and returns a silent 200 OK without writing to the database.
* **Public Contact Form (`src/components/contact/contact-form.tsx`)**: Styled anti-slop form embedded on `/home/contact`.
* **Admin Inquiries Inbox (`src/components/admin/inquiries-panel.tsx`)**: Embedded on `/admin` dashboard with search, status filters (`new`, `in_review`, `replied`, `archived`), detail drawer, note editor, and delete confirmation.

### E. Media Management (`src/app/api/admin/upload/route.ts`)
* Direct authenticated file uploads to **Firebase Storage** (`jeptahz-repo.firebasestorage.app`) with local disk fallback (`public/uploads/`).
* Restricts executable files (`.exe`, `.bat`, `.cmd`, `.msi`, `.vbs`, etc.) and enforces a 10MB maximum file size limit.

### F. System Audit Trail (`src/lib/audit.ts`, `/api/admin/audit`, `src/components/admin/audit-panel.tsx`)
* **Traceable Mutation Tracking**: Captures mutations, publishing commits, reverts, and inquiry status updates into Firestore `audit_log`.
* **Admin Audit Viewer**: Live filterable audit log stream embedded in `/admin` with time stamps, action chips, and metadata inspection.

### G. Hardening & Security Standards (Blueprint Section 9.5 & Phase 10)
* **Security Headers (`next.config.ts`)**: Injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Robots-Tag: noindex, nofollow` on all `/admin/*` and `/login` routes.
* **Storage Domains (`next.config.ts`)**: Whitelists `storage.googleapis.com` and `firebasestorage.googleapis.com` in `images.remotePatterns`.
* **Search Engine Isolation (`src/app/robots.ts`)**: Excludes `/admin`, `/admin/*`, `/login`, and `/api/*` from search engine crawlers.

---

## 3. Environment Variables Configuration

The following variables are documented in `.env.example` and configured in `.env.local`:

```bash
# ==============================================================================
# FIREBASE CREDENTIALS & STORAGE (Primary Live Backend)
# ==============================================================================
FIREBASE_PROJECT_ID="jeptahz-repo"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@jeptahz-repo.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_STORAGE_BUCKET="jeptahz-repo.firebasestorage.app"

# Firebase Client Configuration (Safe for browser)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyBS_..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="jeptahz-repo.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="jeptahz-repo"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="jeptahz-repo.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="477628727743"
NEXT_PUBLIC_FIREBASE_APP_ID="1:477628727743:web:14bdd09f4407b638f7210a"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-DW82H469JT"

# ==============================================================================
# ADMIN AUTHENTICATION & SESSIONS
# ==============================================================================
ADMIN_PASSPHRASE="09355566245"
ADMIN_PASSWORD_HASH="$argon2id$v=19$m=19456,t=2,p=1$..."
SESSION_SECRET="d5690775cdc554ab1710d74cc923221ee9317aafb431bf672d7fbeab673e2db2"

# ==============================================================================
# CONTENT MODE & PUBLISHING ENGINE (Blueprint 2.0)
# ==============================================================================
CONTENT_MODE="static"                   # static | staged | live
PUBLISH_ENABLED="true"                 # Set true to allow commits to GitHub main
SNAPSHOT_PATH="src/db/seeds/mock-archive.json"

# GitHub Contents API Sync
GITHUB_TOKEN="your_github_personal_access_token_here"
GITHUB_OWNER="JeptahIldefonso"
GITHUB_REPO="JeptahzRepo"
GITHUB_BRANCH="main"

# Vercel Deployment Tracking
VERCEL_TOKEN="your_vercel_token_here"
VERCEL_PROJECT_ID="your_vercel_project_id_here"
```

---

## 4. Verification & QA Matrix

| # | Check | Command / Action | Result |
|---|-------|------------------|--------|
| 1 | **Unit Test Suite** | `npm test` | **19/19 tests passed** (Deterministic hashing, secret redaction, Vercel commit matching, stale locks, content contract validation, honeypot detection). |
| 2 | **Type Integrity** | `npm run typecheck` | **Zero errors (`tsc --noEmit` exited with code 0).** |
| 3 | **Production Build** | `npm run build` | **All 32 routes compiled and optimized into static/SSG/dynamic bundles.** |
| 4 | **Admin Gate** | Navigate to `/admin` without session | Redirects to `/login?from=/admin` with `X-Robots-Tag: noindex, nofollow`. |
| 5 | **Contact Rate Limit** | Submit `/api/contact` 6 times | 6th attempt blocked with HTTP 429 (`Too many requests`). |
| 6 | **Bot Honeypot** | Submit `/api/contact` with `website="http://spam.org"` | Returns 200 OK fake success; silently omitted from database. |
| 7 | **Publish Diff** | Modify content in admin | State changes to "Unpublished changes"; Publish button enables. |
| 8 | **Publish Lock** | Double-click Publish | Concurrency lock admits only one operation; second receives 409 conflict. |
| 9 | **Revertability** | Click Revert to previous snapshot | Produces new forward Git commit restoring previous state without history rewrite. |

---

## 5. How to Publish and Revert (Operator Guide)

### To Publish Changes:
1. Open the Admin Studio at `/admin` and log in.
2. Make edits to applications, documents, changelog items, or site settings.
3. Observe the **Publish Panel** at the top of `/admin`: the badge will reflect `"Unpublished changes"` and display differing live vs. saved hash digests.
4. Click **Publish to Live**. A confirmation modal will appear.
5. Confirm the publication. The engine will:
   - Compile a canonical snapshot from Firestore / PostgreSQL.
   - Commit the updated `src/db/seeds/mock-archive.json` to GitHub `main`.
   - Poll Vercel's Deployments API until the build reaches `READY`.
6. Once completed, the badge displays `"Live and up to date"`.

### To Revert to a Previous Version:
1. On the **Publish Panel** at `/admin`, expand the **Publish History & Revert** section.
2. Locate the previous snapshot entry and click **Revert**.
3. Confirm in the dialog. The engine retrieves the previous snapshot and submits a new forward commit to GitHub `main`, immediately triggering Vercel to rebuild the previous version.

---

## 6. Known Limitations & Recommendations

1. **GitHub Fine-Grained Token Expiry**: Fine-grained Personal Access Tokens have a maximum validity of 1 year. Remember to regenerate `GITHUB_TOKEN` before expiration to avoid publish failures.
2. **Vercel Team ID**: If the Vercel project is ever moved under a Vercel Team account, add `VERCEL_TEAM_ID="team_xxx"` to environment variables.
3. **Local In-Memory Rate Limiting**: The current sliding-window rate limiter stores attempts in memory, which resets on serverless cold starts. For high-volume production deployments with multiple edge regions, configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
