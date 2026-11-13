# Universal Admin Panel Blueprint

> **Version:** 2.0.0
> **Stack:** Next.js (App Router) · React · TypeScript · Drizzle ORM · PostgreSQL (Neon) · Vercel
> **Purpose:** One repeatable method for building a database-backed admin panel (CRUD + publish + revert) for portfolios, client sites, blogs and small SaaS products. It works for **static** sites (content committed to the repo) and **non-static** sites (content read from the database).
> **Audience:** The site owner and any AI coding agent (Antigravity, Claude Code, etc.) building a new site.

---

## Table of Contents

0. [How to Use This Document](#0-how-to-use-this-document)
1. [Design Principles](#1-design-principles)
2. [Choose a Content Mode](#2-choose-a-content-mode)
3. [Architecture](#3-architecture)
4. [Recommended Stack](#4-recommended-stack)
5. [Project Structure](#5-project-structure)
6. [Environment Variables](#6-environment-variables)
7. [Database Schema](#7-database-schema)
8. [Content Contract & Read Layer](#8-content-contract--read-layer)
9. [Authentication, Roles & Security](#9-authentication-roles--security)
10. [CRUD Pattern](#10-crud-pattern)
11. [Admin UI Specification](#11-admin-ui-specification)
12. [Media Management](#12-media-management)
13. [Publish System](#13-publish-system)
14. [Inquiries (Contact Form)](#14-inquiries-contact-form)
15. [Routes & Actions Reference](#15-routes--actions-reference)
16. [Testing & QA](#16-testing--qa)
17. [Deployment Checklist](#17-deployment-checklist)
18. [Implementation Phases](#18-implementation-phases)
19. [AI Agent Prompt Template](#19-ai-agent-prompt-template)
20. [Troubleshooting](#20-troubleshooting)
21. [Definition of Done](#21-definition-of-done)

---

## 0. How to Use This Document

This file is a **template**. Copy it into the new project (for example `docs/ADMIN_PANEL_BLUEPRINT.md`) and build from it.

**Rules for any AI agent using this file:**

1. Work **only inside the new project folder** given by the owner.
2. **Never read, edit, run commands in, or copy from** `C:\Development\PROJECTS\JeptahPortfolio`. It is a finished live project. Read-only access is allowed only if the owner explicitly asks.
3. **Plan first.** Reply with a short plan (content types, folder tree, env vars, phases) and **wait for approval** before writing code.
4. **Build in phases** (Section 18). After each phase run lint, tests and build, and fix errors before moving on.
5. **Never invent content types** that are not requested. Ask when unsure.
6. **Never commit secrets.** Only `.env.example` is committed.
7. **Finish with a report** (`ADMIN_REPORT.md`): what was built, env vars required, how to test, known limitations.

> The code in this document is a working pattern, not a copy-paste guarantee. Check package versions and adjust imports to the versions installed in the project.

---

## 1. Design Principles

| # | Principle | What it means in practice |
|---|-----------|---------------------------|
| 1 | **Route-group isolation** | Admin lives in `(admin)/admin`, the public site in `(public)`. Styles, layouts and bundles never mix. |
| 2 | **Server-first security** | Every page, action and API route verifies the session and role on the server. UI hiding is cosmetic. |
| 3 | **One content contract** | A single Zod schema (`SiteContent`) defines what the public site receives, whatever the mode. |
| 4 | **Drafts never leak** | Editing changes drafts only. Visitors see content only through the published path. |
| 5 | **Boring, consistent CRUD** | Every section uses the same action shape, validation, error format and UI components. |
| 6 | **Everything is reversible** | Every publish is stored as a snapshot. Revert is one click. |
| 7 | **Everything is traceable** | Mutations, publishes and reverts are written to an audit log. |
| 8 | **Fail safe** | A failed publish or failed build never breaks the live site. The previous version stays live. |

---

## 2. Choose a Content Mode

The same admin panel, schema and CRUD work in all modes. Only the **read layer** and the **publish step** change. The mode is set with one variable: `CONTENT_MODE`.

| Mode | `CONTENT_MODE` | Public site reads | Goes live when | Best for |
|------|----------------|-------------------|----------------|----------|
| **Static** | `static` | `content/snapshot.json` in the repo | Publish commits the snapshot to GitHub, then Vercel rebuilds | Portfolios, landing pages, brochure sites. Fastest and cheapest. |
| **Dynamic: staged** | `staged` | Latest snapshot row in the database (cached) | Publish stores a new snapshot and revalidates the cache (seconds, no rebuild) | Client sites that need review before changes appear. |
| **Dynamic: live** | `live` | Live tables directly (published rows only, cached) | Immediately on save (cache revalidated) | Blogs, internal tools, frequently updated data. |

**Decision guide**

- Content changes a few times per week or less, and you want maximum speed and zero database reads for visitors → **static**.
- You want a draft/review step but do not want to wait for a rebuild → **staged**.
- Every edit should appear instantly and there is no need to hold changes back → **live**.

**Always dynamic, in every mode:** the admin panel itself, login, inquiries (visitors write them), and media uploads. Only the *public content* is static or staged.

---

## 3. Architecture

```mermaid
flowchart LR
    Admin["Admin UI (/admin)"] -->|"Server Actions + Zod"| DB[("PostgreSQL: drafts, snapshots, audit")]
    DB --> Mode{"CONTENT_MODE"}

    Mode -->|static| Build["Publish service builds snapshot"]
    Build -->|"commit content/snapshot.json"| GH["GitHub (main)"]
    GH -->|"auto-deploy"| Vercel["Vercel build"]
    Vercel --> Site["Public site reads snapshot.json"]

    Mode -->|staged| Snap["Snapshot row in DB"]
    Snap -->|"revalidateTag"| Site2["Public site reads cached snapshot"]

    Mode -->|live| Live["Published rows in DB"]
    Live -->|"revalidateTag on save"| Site3["Public site reads cached queries"]

    Visitor["Visitor contact form"] -->|"POST /api/contact"| DB
    Admin --> Media[("S3 / R2 storage")]
```

**Request flow summary**

1. The admin edits content. Actions validate input, write to the database, increase the draft version and write an audit entry.
2. The admin presses **Publish** (static and staged modes).
3. The publish service builds one validated `SiteContent` object, stores it as a snapshot, and either commits it to GitHub (static) or revalidates the cache (staged).
4. The public site renders from the published path only.

---

## 4. Recommended Stack

| Layer | Recommended | Alternatives |
|-------|-------------|--------------|
| Framework | Next.js App Router, Server Actions | Remix, Vite + React Router |
| Language & validation | TypeScript + Zod | Valibot |
| UI | Tailwind CSS + shadcn/ui (Radix) | Mantine, Chakra |
| Icons | Lucide React | Tabler, Heroicons |
| Auth | Auth.js (credentials or OAuth) | Clerk, Supabase Auth, Lucia |
| Database / ORM | PostgreSQL (Neon) + Drizzle ORM | Supabase, Prisma, Turso |
| Storage | Cloudflare R2 / S3 / Vercel Blob | Uploadthing, Supabase Storage |
| Rich text | Tiptap | Novel, MDX editor |
| Tables | TanStack Table v8 | Custom |
| Forms | React Hook Form + `@hookform/resolvers` | Conform |
| Rate limiting | Upstash Ratelimit (or a DB counter) | In-memory (dev only) |
| Tests | Vitest + Playwright | Jest, Cypress |

Pin major versions in `package.json`. This document assumes **Zod 4** and **Next.js 16** conventions and notes the differences for older versions where they matter.

---

## 5. Project Structure

```text
repo-root/
├── content/
│   └── snapshot.json                  # Published content (static mode). Written ONLY by the publish service.
├── drizzle/                           # Generated migrations (commit them)
├── scripts/
│   ├── seed-admin.ts                  # Creates the first superadmin
│   └── seed-content.ts                # Optional demo content
├── src/
│   ├── proxy.ts                       # Optimistic /admin gate (Next.js 16). Name it middleware.ts on Next.js 15.
│   ├── app/
│   │   ├── (public)/                  # Public site: layout.tsx, page.tsx, projects/, blog/
│   │   ├── (admin)/
│   │   │   ├── layout.tsx             # Providers, toaster
│   │   │   ├── login/page.tsx
│   │   │   └── admin/
│   │   │       ├── layout.tsx         # Sidebar, topbar, mobile drawer
│   │   │       ├── page.tsx           # Dashboard + Publish panel
│   │   │       ├── projects/          # page.tsx, new/page.tsx, [id]/page.tsx
│   │   │       ├── posts/
│   │   │       ├── inquiries/
│   │   │       ├── media/
│   │   │       ├── settings/
│   │   │       ├── publish/page.tsx   # History, status, revert
│   │   │       ├── audit/page.tsx
│   │   │       └── users/page.tsx     # Superadmin only
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── contact/route.ts                 # Public lead submission
│   │       └── admin/
│   │           ├── upload/route.ts              # Presigned upload URL
│   │           └── publish/status/route.ts      # Deployment status polling
│   ├── components/
│   │   ├── admin/                     # sidebar, topbar, data-table, image-upload-zone,
│   │   │                              # status-badge, confirm-dialog, publish-panel, form-fields
│   │   └── ui/                        # shadcn/ui primitives
│   └── lib/
│       ├── auth.ts                    # Auth.js config
│       ├── rbac.ts                    # requireRole(), run() wrapper
│       ├── db/
│       │   ├── index.ts               # Database client
│       │   └── schema.ts              # Tables
│       ├── content/
│       │   ├── schema.ts              # SiteContent Zod schema + types
│       │   ├── build.ts               # buildContentFromDb()
│       │   └── index.ts               # getContent() mode switch
│       ├── actions/
│       │   ├── _shared.ts             # ActionResult, afterMutation(), writeAudit()
│       │   ├── projects.ts            # Same shape for posts.ts, settings.ts, media.ts, ...
│       │   └── publish.ts             # publishSite(), revertToSnapshot()
│       ├── publish/
│       │   ├── github.ts              # commitSnapshot()
│       │   ├── vercel.ts              # getDeploymentForCommit()
│       │   └── lock.ts                # acquirePublishLock(), releasePublishLock()
│       ├── validators/                # Shared Zod input schemas (project.ts, post.ts, inquiry.ts, ...)
│       └── storage.ts                 # S3 / R2 client
├── tests/
├── .env.example
├── drizzle.config.ts
└── ADMIN_REPORT.md                    # Written by the agent at the end
```

---

## 6. Environment Variables

`.env.example` (commit this file; never commit `.env.local`):

```bash
# ---------- Core ----------
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
AUTH_SECRET=                         # openssl rand -base64 32
NEXT_PUBLIC_SITE_URL=https://example.com

# ---------- Content mode ----------
CONTENT_MODE=static                  # static | staged | live
PUBLISH_ENABLED=false                # true only in production. Prevents local dev from committing to main.

# ---------- Static mode: GitHub publish ----------
GITHUB_TOKEN=                        # Fine-grained token, THIS repo only, Contents: Read and write
GITHUB_REPO=owner/repo
GITHUB_BRANCH=main
SNAPSHOT_PATH=content/snapshot.json

# ---------- Static mode: deployment status ----------
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
VERCEL_TEAM_ID=                      # Only for team projects

# ---------- Storage (media) ----------
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_URL=

# ---------- Rate limiting (optional) ----------
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Set the same variables in **Vercel → Project → Settings → Environment Variables**. Use `PUBLISH_ENABLED=true` in Production only. For local testing of static publishing, point `GITHUB_BRANCH` at a throwaway branch such as `content-dev`.

---

## 7. Database Schema

`src/lib/db/schema.ts`. Every content table has `id`, timestamps and a `published` flag. `published = true` means "include in the public content".

```typescript
import {
  pgTable, text, timestamp, boolean, uuid, integer, serial, jsonb, index,
} from 'drizzle-orm/pg-core';
import type { SiteContent } from '@/lib/content/schema';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow().$onUpdate(() => new Date()).notNull(),
};

// 1. Admin users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['superadmin', 'editor', 'viewer'] }).default('editor').notNull(),
  avatarUrl: text('avatar_url'),
  failedLogins: integer('failed_logins').default(0).notNull(),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  ...timestamps,
});

// 2. Projects / showcase items
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  summary: text('summary').notNull(),
  description: text('description'),                       // Markdown or HTML
  coverImage: text('cover_image'),
  galleryImages: jsonb('gallery_images').$type<string[]>().default([]).notNull(),
  technologies: jsonb('technologies').$type<string[]>().default([]).notNull(),
  liveUrl: text('live_url'),
  githubUrl: text('github_url'),
  featured: boolean('featured').default(false).notNull(),
  published: boolean('published').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  ...timestamps,
}, (t) => [index('projects_published_sort_idx').on(t.published, t.sortOrder)]);

// 3. Posts / case studies
export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),                     // Markdown / MDX / Tiptap JSON
  coverImage: text('cover_image'),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  published: boolean('published').default(false).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  ...timestamps,
});

// 4. Inquiries (never part of public content)
export const inquiries = pgTable('inquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  budgetRange: text('budget_range'),
  message: text('message').notNull(),
  status: text('status', { enum: ['new', 'in_review', 'replied', 'archived'] }).default('new').notNull(),
  notes: text('notes'),                                   // Internal admin notes
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Site settings (key/value): general, seo, social_links, contact
export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

// 6. Media library
export const media = pgTable('media', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),                    // Storage object key
  url: text('url').notNull(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  alt: text('alt'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 7. Content state: one row (id = 1) that tracks draft vs published
export const contentState = pgTable('content_state', {
  id: integer('id').primaryKey().default(1),
  draftVersion: integer('draft_version').default(0).notNull(),       // +1 on every content mutation
  publishedVersion: integer('published_version').default(0).notNull(),
  lastPublishedAt: timestamp('last_published_at', { withTimezone: true }),
  lastPublishedBy: uuid('last_published_by').references(() => users.id),
  publishLockedUntil: timestamp('publish_locked_until', { withTimezone: true }),
});

// 8. Snapshots: full publish history (used for revert)
export const snapshots = pgTable('snapshots', {
  id: serial('id').primaryKey(),
  kind: text('kind', { enum: ['publish', 'revert'] }).notNull(),
  version: integer('version').notNull(),                  // draftVersion at the time of publish
  content: jsonb('content').$type<SiteContent>().notNull(),
  commitSha: text('commit_sha'),                          // static mode only
  deploymentId: text('deployment_id'),                    // static mode only
  deploymentUrl: text('deployment_url'),
  status: text('status', { enum: ['queued', 'building', 'ready', 'error'] }).default('queued').notNull(),
  error: text('error'),
  note: text('note'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 9. Audit log
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),                       // e.g. project.create, publish, revert
  entity: text('entity'),
  entityId: text('entity_id'),
  meta: jsonb('meta'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index('audit_created_idx').on(t.createdAt)]);
```

**Rules**

- Migrations only (`drizzle-kit generate` then `migrate`). Never edit production by hand.
- Seed `content_state` with one row (`id = 1`) in the first migration or seed script.
- Use `drizzle-kit push` only on a throwaway development database.
- The `neon-http` driver does not support transactions. Use the `neon-serverless` (WebSocket) or `pg` driver if an action needs a transaction.
- Add a table per extra content type (services, testimonials, team, faq) by copying the `projects` pattern.

---

## 8. Content Contract & Read Layer

### 8.1 The contract

`src/lib/content/schema.ts` defines exactly what the public site can receive. **Private fields (notes, emails, internal flags) must never appear here.**

```typescript
import { z } from 'zod';

export const projectPublicSchema = z.object({
  slug: z.string(), title: z.string(), subtitle: z.string().nullable(),
  summary: z.string(), description: z.string().nullable(),
  coverImage: z.string().nullable(), galleryImages: z.array(z.string()),
  technologies: z.array(z.string()), liveUrl: z.string().nullable(),
  githubUrl: z.string().nullable(), featured: z.boolean(),
});

export const postPublicSchema = z.object({
  slug: z.string(), title: z.string(), excerpt: z.string().nullable(),
  content: z.string(), coverImage: z.string().nullable(),
  tags: z.array(z.string()), publishedAt: z.string().nullable(),
});

export const siteContentSchema = z.object({
  version: z.number(),                       // draftVersion this snapshot was built from
  generatedAt: z.string(),                   // ISO date
  settings: z.record(z.string(), z.unknown()),
  projects: z.array(projectPublicSchema),    // already sorted by sortOrder
  posts: z.array(postPublicSchema),          // already sorted by publishedAt desc
});

export type SiteContent = z.infer<typeof siteContentSchema>;

export const emptyContent: SiteContent = {
  version: 0, generatedAt: '1970-01-01T00:00:00.000Z', settings: {}, projects: [], posts: [],
};
```

Create `content/snapshot.json` on day one with the same shape as `emptyContent`, so the first static build never fails.

### 8.2 Single builder

`buildContentFromDb()` is the **only** function that turns database rows into `SiteContent`. Snapshots (static and staged) and the live mode all use it, so every mode returns the identical shape.

```typescript
// src/lib/content/build.ts
import 'server-only';
import { eq, asc, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { projects, posts, siteSettings, contentState } from '@/lib/db/schema';
import { siteContentSchema, type SiteContent } from './schema';

export async function buildContentFromDb(): Promise<SiteContent> {
  const [state] = await db.select().from(contentState).where(eq(contentState.id, 1));
  const [projectRows, postRows, settingRows] = await Promise.all([
    db.select().from(projects).where(eq(projects.published, true)).orderBy(asc(projects.sortOrder)),
    db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.publishedAt)),
    db.select().from(siteSettings),
  ]);

  const content: SiteContent = {
    version: state?.draftVersion ?? 0,
    generatedAt: new Date().toISOString(),
    settings: Object.fromEntries(settingRows.map((s) => [s.key, s.value])),
    projects: projectRows.map(({ id, published, sortOrder, createdAt, updatedAt, ...pub }) => pub),
    posts: postRows.map(({ id, published, createdAt, updatedAt, publishedAt, ...rest }) => ({
      ...rest, publishedAt: publishedAt?.toISOString() ?? null,
    })),
  };
  return siteContentSchema.parse(content);   // Fails loudly if the shape drifts
}
```

### 8.3 Mode switch

Public pages call `getContent()` and **never** query the database or import the JSON directly.

```typescript
// src/lib/content/index.ts
import 'server-only';
import { unstable_cache } from 'next/cache';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { snapshots } from '@/lib/db/schema';
import { buildContentFromDb } from './build';
import { siteContentSchema, emptyContent, type SiteContent } from './schema';

export const CONTENT_TAG = 'content';

const getLive = unstable_cache(buildContentFromDb, ['site-content-live'], { tags: [CONTENT_TAG] });

const getStaged = unstable_cache(async (): Promise<SiteContent> => {
  const [row] = await db.select({ content: snapshots.content }).from(snapshots)
    .where(eq(snapshots.status, 'ready')).orderBy(desc(snapshots.id)).limit(1);
  return siteContentSchema.parse(row?.content ?? emptyContent);
}, ['site-content-staged'], { tags: [CONTENT_TAG] });

export async function getContent(): Promise<SiteContent> {
  switch (process.env.CONTENT_MODE ?? 'static') {
    case 'live':   return getLive();
    case 'staged': return getStaged();
    default: {
      const snapshot = (await import('@content/snapshot.json')).default;   // tsconfig alias: "@content/*": ["./content/*"]
      return siteContentSchema.parse(snapshot);
    }
  }
}

// Convenience selectors
export const getProjects = async () => (await getContent()).projects;
export const getProject = async (slug: string) => (await getProjects()).find((p) => p.slug === slug) ?? null;
export const getPosts = async () => (await getContent()).posts;
```

Notes:

- Enable `"resolveJsonModule": true` in `tsconfig.json`.
- `unstable_cache` can be replaced with `'use cache'` and `cacheTag('content')` if Cache Components are enabled.
- Use `generateStaticParams` in `(public)` dynamic routes so static and staged sites pre-render pages.

---

## 9. Authentication, Roles & Security

### 9.1 Defense in depth

| Layer | Purpose | Notes |
|-------|---------|-------|
| 1. `proxy.ts` | Redirect visitors without a session cookie | **Optimistic only.** A cookie check is not verification. |
| 2. `requireRole()` | Verify the real session and role | Called in **every** admin page, server action and API route. |
| 3. Input validation | Zod on every write and public form | Reject unknown fields. |
| 4. Rate limiting | Login, contact form, upload | Prevents brute force and spam. |
| 5. Least privilege | DB user, GitHub token, Vercel token | Token scoped to one repo / one project. |
| 6. Audit log | Who changed what, when | Mandatory for publish, revert, delete, user changes. |

### 9.2 Optimistic gate

```typescript
// src/proxy.ts  (Next.js 16: export `proxy`. Next.js 15: file middleware.ts, export `middleware`.)
import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token'];

export function proxy(req: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name));
  if (!hasSession) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };   // /login stays outside the matcher
```

### 9.3 Real check: `requireRole` and the `run` wrapper

```typescript
// src/lib/rbac.ts
import 'server-only';
import { auth } from '@/lib/auth';
import type { ActionResult } from '@/lib/actions/_shared';

const rank = { viewer: 0, editor: 1, superadmin: 2 } as const;
export type Role = keyof typeof rank;
export type SessionUser = { id: string; email: string; role: Role };

export class AuthError extends Error {
  constructor(public code: 'UNAUTHENTICATED' | 'FORBIDDEN', message: string) { super(message); }
}

export async function requireRole(min: Role): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) throw new AuthError('UNAUTHENTICATED', 'Please sign in');
  if (rank[user.role] < rank[min]) throw new AuthError('FORBIDDEN', 'You do not have permission');
  return user;
}

/** Wraps every server action: auth check + uniform error handling. */
export async function run<T>(
  min: Role,
  fn: (user: SessionUser) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    return await fn(await requireRole(min));
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, error: e.message };
    console.error('[action]', e);
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}
```

In admin **pages** (server components), call `await requireRole('viewer')` at the top of `admin/layout.tsx` and again in any page that needs a higher role.

### 9.4 Permission matrix

| Capability | viewer | editor | superadmin |
|------------|:------:|:------:|:----------:|
| View admin and content | ✓ | ✓ | ✓ |
| Create / edit / reorder content | | ✓ | ✓ |
| Delete content | | | ✓ |
| Manage inquiries (status, notes) | | ✓ | ✓ |
| Delete inquiries | | | ✓ |
| Upload media | | ✓ | ✓ |
| Edit settings and SEO | | ✓ | ✓ |
| Publish | | ✓ | ✓ |
| Revert | | | ✓ |
| Manage users, view audit log | | | ✓ |

### 9.5 Security checklist

- [ ] Passwords hashed with `argon2` or `bcryptjs` (cost ≥ 12). Never stored or logged in plain text.
- [ ] Session cookie: `httpOnly`, `secure`, `sameSite=lax`. Session lifetime ≤ 7 days with idle refresh.
- [ ] Login lockout after 5 failed attempts (use `failedLogins` and `lockedUntil`). Generic error message (never reveal whether the email exists).
- [ ] `import 'server-only'` in every file that touches secrets, the database or tokens.
- [ ] Tokens (`GITHUB_TOKEN`, `VERCEL_TOKEN`, S3 keys) are server-only. Never prefix with `NEXT_PUBLIC_`.
- [ ] GitHub token is fine-grained, limited to one repository, **Contents: Read and write** only.
- [ ] Security headers in `next.config.ts`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`), `Referrer-Policy: strict-origin-when-cross-origin`, and a Content-Security-Policy suited to the site.
- [ ] `/admin` and `/login` use `<meta name="robots" content="noindex">` and are excluded from the sitemap.
- [ ] Render user-supplied Markdown/HTML through a sanitizer (for example `rehype-sanitize` or DOMPurify).
- [ ] Never expose database errors to the client. Log on the server, return a friendly message.
- [ ] Rotate tokens and the admin password if a device or collaborator is lost.

---

## 10. CRUD Pattern

All sections (projects, posts, services, testimonials, …) follow the same pattern. Copy `projects.ts`, rename, adjust the schema.

### 10.1 Shared helpers

```typescript
// src/lib/actions/_shared.ts
import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { contentState, auditLog } from '@/lib/db/schema';
import { CONTENT_TAG } from '@/lib/content';
import type { SessionUser } from '@/lib/rbac';

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

type AfterMutation = {
  user: SessionUser;
  action: string;                // 'project.create'
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
  paths?: string[];              // Admin paths to refresh
  content?: boolean;             // true (default) if this change affects public content
};

export async function afterMutation(o: AfterMutation) {
  const affectsContent = o.content ?? true;
  if (affectsContent) {
    await db.update(contentState)
      .set({ draftVersion: sql`${contentState.draftVersion} + 1` })
      .where(eq(contentState.id, 1));
  }
  await db.insert(auditLog).values({
    userId: o.user.id, action: o.action, entity: o.entity, entityId: o.entityId, meta: o.meta,
  });
  o.paths?.forEach((p) => revalidatePath(p));
  if (affectsContent && process.env.CONTENT_MODE === 'live') {
    revalidateTag(CONTENT_TAG, 'max');          // Next.js 16 signature. On Next.js 15 use revalidateTag(CONTENT_TAG).
  }
}
```

### 10.2 Action template

```typescript
// src/lib/actions/projects.ts
'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { projectInputSchema } from '@/lib/validators/project';
import { run } from '@/lib/rbac';
import { afterMutation, type ActionResult } from './_shared';

export async function createProject(input: unknown): Promise<ActionResult<{ id: string }>> {
  return run('editor', async (user) => {
    const parsed = projectInputSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: 'Please fix the highlighted fields', fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }
    const [row] = await db.insert(projects).values(parsed.data).returning({ id: projects.id });
    await afterMutation({ user, action: 'project.create', entity: 'project', entityId: row.id, paths: ['/admin/projects'] });
    return { ok: true, data: { id: row.id } };
  });
}

export async function updateProject(id: string, input: unknown, expectedUpdatedAt: string): Promise<ActionResult> {
  return run('editor', async (user) => {
    const parsed = projectInputSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Please fix the highlighted fields', fieldErrors: z.flattenError(parsed.error).fieldErrors };

    const [current] = await db.select({ updatedAt: projects.updatedAt }).from(projects).where(eq(projects.id, id));
    if (!current) return { ok: false, error: 'Project not found' };
    if (current.updatedAt.toISOString() !== expectedUpdatedAt) {
      return { ok: false, error: 'This item was changed by someone else. Reload and try again.' };   // Lost-update protection
    }
    await db.update(projects).set(parsed.data).where(eq(projects.id, id));
    await afterMutation({ user, action: 'project.update', entity: 'project', entityId: id, paths: ['/admin/projects', `/admin/projects/${id}`] });
    return { ok: true, data: undefined };
  });
}

export async function deleteProject(id: string): Promise<ActionResult> {
  return run('superadmin', async (user) => {
    await db.delete(projects).where(eq(projects.id, id));
    await afterMutation({ user, action: 'project.delete', entity: 'project', entityId: id, paths: ['/admin/projects'] });
    return { ok: true, data: undefined };
  });
}

export async function reorderProjects(order: { id: string; sortOrder: number }[]): Promise<ActionResult> {
  return run('editor', async (user) => {
    await Promise.all(order.map((o) => db.update(projects).set({ sortOrder: o.sortOrder }).where(eq(projects.id, o.id))));
    await afterMutation({ user, action: 'project.reorder', entity: 'project', paths: ['/admin/projects'] });
    return { ok: true, data: undefined };
  });
}
```

### 10.3 Operations every section must support

| Operation | Action | Min role | Notes |
|-----------|--------|----------|-------|
| List | Server component query | viewer | Search, filter, sort and pagination via `searchParams` |
| Read one | Server component query | viewer | 404 page if missing |
| Create | `createX` | editor | Zod validation, auto-slug |
| Update | `updateX` | editor | Lost-update protection with `updatedAt` |
| Delete | `deleteX` | superadmin | Confirm dialog in the UI |
| Duplicate | `duplicateX` | editor | Appends "(copy)", new slug, `published = false` |
| Toggle published / featured | `toggleX` | editor | Inline switch in the table |
| Reorder | `reorderX` | editor | Drag and drop, saves `sortOrder` |
| Bulk publish / unpublish / delete | `bulkX` | editor / superadmin | Checkbox selection in the table |

### 10.4 Rules

1. **Never trust the client.** Re-validate with Zod on the server. Reject unknown keys (`.strict()`).
2. **Slugs:** generate from the title (`slugify`), force lowercase, ensure uniqueness (append `-2`, `-3`), and never change a published slug silently.
3. **Validation errors** return `fieldErrors` so forms can show messages under each input.
4. **Uniform results:** every action returns `ActionResult`. The UI shows a toast for `error` and a success toast otherwise.
5. **Inquiries and uploads** call `afterMutation({ content: false })` because they do not change public content.
6. **No business logic in components.** Components call actions. Actions call the database.

---

## 11. Admin UI Specification

### 11.1 Pages

| Route | Purpose | Key elements |
|-------|---------|--------------|
| `/login` | Sign in | Email and password, generic error, lockout message |
| `/admin` | Dashboard | Stat cards (published, drafts, new inquiries), **Publish panel**, recent activity |
| `/admin/projects` | Project list | Data table: search, filters, sort, pagination, bulk actions, drag reorder, inline toggles |
| `/admin/projects/new` and `/[id]` | Create / edit | Form with sections, live slug preview, image picker, unsaved-changes guard |
| `/admin/posts` | Post list and editor | Same as projects plus Tiptap editor and tag input |
| `/admin/inquiries` | Lead inbox | Status filter, detail drawer, internal notes, mark replied/archived |
| `/admin/media` | Asset manager | Grid, upload (drag and drop), alt text editor, copy URL, delete with usage warning |
| `/admin/settings` | Site config | Tabs: General, SEO, Social links, Contact |
| `/admin/publish` | Publish history | Table of snapshots, status, commit link, **Revert** |
| `/admin/audit` | Audit log | Filter by user, action, date (superadmin) |
| `/admin/users` | User management | Create, change role, disable (superadmin) |

### 11.2 Reusable components

`sidebar`, `topbar` (user menu, theme toggle), `data-table` (TanStack), `form-fields` (text, textarea, slug, switch, tags, image picker, rich text), `image-upload-zone`, `status-badge`, `confirm-dialog`, `publish-panel`, `empty-state`, `page-header`.

### 11.3 UX standards

- Every list has **loading**, **empty**, and **error** states.
- Destructive actions (delete, revert) use a **confirm dialog** that names the item.
- Forms warn about **unsaved changes** before navigation.
- Save buttons show a **pending state** and are disabled while submitting (prevents double submits).
- Toast on every result: success, validation error, permission error, server error.
- Fully **responsive** (sidebar becomes a drawer on mobile) with **dark mode**.
- **Accessible:** labels on all inputs, visible focus rings, keyboard-operable dialogs, `aria-live` for toasts, contrast ratio ≥ 4.5:1.
- **Dirty indicator:** an "Unpublished changes" badge appears when `draftVersion > publishedVersion`.

### 11.4 Publish panel (state machine)

| State | Condition | UI |
|-------|-----------|----|
| `clean` | `draftVersion == publishedVersion` | Button disabled, text "Live site is up to date", last published time |
| `dirty` | `draftVersion > publishedVersion` | **Publish** button enabled, badge "Unpublished changes" |
| `publishing` | Publish running | Stepper: Building snapshot → Committing → Queued → Building → Ready (static). Two steps in staged mode. Button disabled. |
| `ready` | Terminal success | Success message, link to the live site, time |
| `error` | Terminal failure | Error message, **Retry** and **Revert** buttons, link to the failed deployment |
| `disabled` | `PUBLISH_ENABLED != true` or mode is `live` | Panel hidden or shows "Publishing is disabled in this environment" |

---

## 12. Media Management

Images and files live in object storage (R2 / S3 / Vercel Blob), **never in the Git repository**. This keeps `snapshot.json` small and builds fast.

### 12.1 Upload flow

1. Admin drops a file in `image-upload-zone`.
2. Client calls `POST /api/admin/upload` with `{ filename, mimeType, size }`.
3. The route checks the role (`editor`), validates type and size, and returns a **presigned PUT URL** and the object key.
4. Client uploads directly to storage.
5. Client calls the `registerMedia` action to save metadata (`key`, `url`, `size`, dimensions, `alt`) in the `media` table.

### 12.2 Presign route

```typescript
// src/app/api/admin/upload/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { requireRole } from '@/lib/rbac';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
});

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024;

const bodySchema = z.object({
  filename: z.string().min(1).max(200),
  mimeType: z.enum(ALLOWED as [string, ...string[]]),
  size: z.number().int().positive().max(MAX_BYTES),
});

export async function POST(req: Request) {
  try { await requireRole('editor'); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid file' }, { status: 400 });

  const safeName = parsed.data.filename.toLowerCase().replace(/[^a-z0-9.\-_]/g, '-');
  const key = `uploads/${new Date().getFullYear()}/${crypto.randomUUID()}-${safeName}`;
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, ContentType: parsed.data.mimeType, ContentLength: parsed.data.size }),
    { expiresIn: 60 },
  );
  return Response.json({ uploadUrl: url, key, publicUrl: `${process.env.S3_PUBLIC_URL}/${key}` });
}
```

### 12.3 Rules

- Allowed: JPEG, PNG, WebP, AVIF, GIF. **Reject SVG** unless it is sanitized server-side.
- Max size 10 MB (adjust per project). Validate on the server, not only in the browser.
- Alt text is **required** before an image can be used in published content.
- Deleting a media item warns if its URL is referenced by any project or post.
- Render with `next/image` and add the storage domain to `images.remotePatterns`.

---

## 13. Publish System

### 13.1 Core idea

A **snapshot** is one validated `SiteContent` object. Publishing means "make this snapshot the one visitors see". Every mode uses the same snapshot, only the delivery differs:

| Mode | Publish does | Time to live |
|------|--------------|--------------|
| `static` | Commits `content/snapshot.json` to GitHub. Vercel auto-deploys. Status is polled. | 1 to 3 minutes |
| `staged` | Inserts a `ready` snapshot row and calls `revalidateTag('content')`. | Seconds |
| `live` | No publish step. Each save calls `revalidateTag('content')`. | Seconds |

**Version tracking:** every content mutation increments `draftVersion`. A publish sets `publishedVersion` to the version it was built from. `draftVersion > publishedVersion` means unpublished changes exist.

> Why Git commit and not "write the file": Vercel's runtime file system is read-only, and static content must be bundled at build time. Committing to the repo triggers the normal build and deploy.

### 13.2 Static mode flow

```text
Publish clicked
  → acquire publish lock (one publish at a time)
  → buildContentFromDb()  (validated with Zod)
  → identical to the latest snapshot? stop with "Nothing to publish"
  → commit content/snapshot.json to GITHUB_BRANCH (GitHub Contents API)
  → insert snapshot row (status: queued, commitSha)
  → set publishedVersion, write audit log, release lock
  → UI polls /api/admin/publish/status?commit=<sha> every 3 seconds
      queued → building → ready | error
  → Vercel keeps the previous deployment live if the new build fails
```

### 13.3 Lock

```typescript
// src/lib/publish/lock.ts
import 'server-only';
import { and, eq, isNull, lt, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { contentState } from '@/lib/db/schema';

/** Atomic: succeeds only if no lock exists or the previous lock expired. */
export async function acquirePublishLock(ttlSeconds = 300): Promise<boolean> {
  const rows = await db.update(contentState)
    .set({ publishLockedUntil: sql`now() + make_interval(secs => ${ttlSeconds})` })
    .where(and(
      eq(contentState.id, 1),
      or(isNull(contentState.publishLockedUntil), lt(contentState.publishLockedUntil, sql`now()`)),
    ))
    .returning({ id: contentState.id });
  return rows.length > 0;
}

export async function releasePublishLock() {
  await db.update(contentState).set({ publishLockedUntil: null }).where(eq(contentState.id, 1));
}
```

### 13.4 GitHub commit

```typescript
// src/lib/publish/github.ts
import 'server-only';

export class PublishError extends Error {}

function gh(path: string, init: RequestInit = {}) {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
}

export async function commitSnapshot(json: string, message: string, attempt = 0): Promise<{ commitSha: string }> {
  const path = process.env.SNAPSHOT_PATH ?? 'content/snapshot.json';
  const branch = process.env.GITHUB_BRANCH ?? 'main';
  const base = `/repos/${process.env.GITHUB_REPO}/contents/${path}`;

  // 1. Current file SHA (required by GitHub to update an existing file)
  const current = await gh(`${base}?ref=${branch}`);
  if (!current.ok && current.status !== 404) {
    throw new PublishError('Could not read the repository. Check GITHUB_TOKEN and GITHUB_REPO.');
  }
  const sha = current.ok ? ((await current.json()) as { sha: string }).sha : undefined;

  // 2. Commit the new file
  const res = await gh(base, {
    method: 'PUT',
    body: JSON.stringify({ message, branch, sha, content: Buffer.from(json, 'utf8').toString('base64') }),
  });

  // Someone else committed in between: re-read the SHA and retry once
  if ((res.status === 409 || res.status === 422) && attempt < 1) return commitSnapshot(json, message, attempt + 1);
  if (!res.ok) throw new PublishError(`GitHub rejected the commit (HTTP ${res.status}).`);

  const data = (await res.json()) as { commit: { sha: string } };
  return { commitSha: data.commit.sha };
}
```

### 13.5 Deployment status (Vercel)

```typescript
// src/lib/publish/vercel.ts
import 'server-only';

export type DeployState = 'queued' | 'building' | 'ready' | 'error';

const STATE_MAP: Record<string, DeployState> = {
  QUEUED: 'queued', INITIALIZING: 'building', BUILDING: 'building',
  READY: 'ready', ERROR: 'error', CANCELED: 'error',
};

export async function getDeploymentForCommit(commitSha: string) {
  const q = new URLSearchParams({ projectId: process.env.VERCEL_PROJECT_ID!, target: 'production', limit: '20' });
  if (process.env.VERCEL_TEAM_ID) q.set('teamId', process.env.VERCEL_TEAM_ID);

  const res = await fetch(`https://api.vercel.com/v6/deployments?${q}`, {
    headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;

  const { deployments } = (await res.json()) as {
    deployments: { uid: string; url: string; state?: string; readyState?: string; meta?: Record<string, string> }[];
  };
  const d = deployments.find((x) => x.meta?.githubCommitSha === commitSha);
  if (!d) return { state: 'queued' as DeployState, id: null, url: null };   // Vercel has not picked up the commit yet

  return { state: STATE_MAP[d.state ?? d.readyState ?? ''] ?? 'building', id: d.uid, url: `https://${d.url}` };
}
```

```typescript
// src/app/api/admin/publish/status/route.ts
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { snapshots } from '@/lib/db/schema';
import { requireRole } from '@/lib/rbac';
import { getDeploymentForCommit } from '@/lib/publish/vercel';

export async function GET(req: Request) {
  try { await requireRole('viewer'); } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }

  const commit = new URL(req.url).searchParams.get('commit');
  if (!commit || !/^[0-9a-f]{40}$/.test(commit)) return Response.json({ error: 'Invalid commit' }, { status: 400 });

  const d = await getDeploymentForCommit(commit);
  if (d) {
    await db.update(snapshots)
      .set({ status: d.state, deploymentId: d.id, deploymentUrl: d.url })
      .where(eq(snapshots.commitSha, commit));
  }
  return Response.json(d ?? { state: 'queued' });
}
```

**Client polling rules:** poll every 3 seconds, stop on `ready` or `error`, give up after 10 minutes with the message "Still building. Check Vercel for details."

### 13.6 Publish and revert actions

```typescript
// src/lib/actions/publish.ts
'use server';

import { desc, eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { contentState, snapshots } from '@/lib/db/schema';
import { buildContentFromDb } from '@/lib/content/build';
import { CONTENT_TAG } from '@/lib/content';
import { siteContentSchema, type SiteContent } from '@/lib/content/schema';
import { commitSnapshot, PublishError } from '@/lib/publish/github';
import { acquirePublishLock, releasePublishLock } from '@/lib/publish/lock';
import { run, type SessionUser } from '@/lib/rbac';
import { afterMutation, type ActionResult } from './_shared';

type PublishData = { snapshotId: number; commitSha: string | null };

const sameContent = (a: SiteContent, b: SiteContent) =>
  JSON.stringify({ ...a, generatedAt: '', version: 0 }) === JSON.stringify({ ...b, generatedAt: '', version: 0 });

/** Delivers one snapshot to the public site for the current mode. */
async function deliver(content: SiteContent, kind: 'publish' | 'revert', user: SessionUser, note?: string): Promise<PublishData> {
  const mode = process.env.CONTENT_MODE ?? 'static';
  if (mode === 'live') throw new PublishError('Publishing is not used in live mode.');
  if (process.env.PUBLISH_ENABLED !== 'true') throw new PublishError('Publishing is disabled in this environment.');

  let commitSha: string | null = null;
  if (mode === 'static') {
    const json = JSON.stringify(content, null, 2) + '\n';
    ({ commitSha } = await commitSnapshot(json, `content: ${kind} v${content.version}`));
  }

  const [snap] = await db.insert(snapshots).values({
    kind, version: content.version, content, commitSha, note, createdBy: user.id,
    status: mode === 'static' ? 'queued' : 'ready',
  }).returning({ id: snapshots.id });

  if (mode === 'staged') revalidateTag(CONTENT_TAG, 'max');
  return { snapshotId: snap.id, commitSha };
}

export async function publishSite(): Promise<ActionResult<PublishData>> {
  return run('editor', async (user) => {
    if (!(await acquirePublishLock())) return { ok: false, error: 'A publish is already in progress.' };
    try {
      const content = await buildContentFromDb();

      const [latest] = await db.select({ content: snapshots.content }).from(snapshots).orderBy(desc(snapshots.id)).limit(1);
      if (latest && sameContent(latest.content, content)) {
        return { ok: false, error: 'Nothing to publish. The content is identical to the live version.' };
      }

      const data = await deliver(content, 'publish', user);
      await db.update(contentState)
        .set({ publishedVersion: content.version, lastPublishedAt: new Date(), lastPublishedBy: user.id })
        .where(eq(contentState.id, 1));
      await afterMutation({
        user, action: 'publish', entity: 'snapshot', entityId: String(data.snapshotId),
        meta: { version: content.version, commitSha: data.commitSha },
        paths: ['/admin', '/admin/publish'], content: false,
      });
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e instanceof PublishError ? e.message : 'Publish failed. The live site was not changed.' };
    } finally {
      await releasePublishLock();
    }
  });
}

export async function revertToSnapshot(snapshotId: number): Promise<ActionResult<PublishData>> {
  return run('superadmin', async (user) => {
    if (!(await acquirePublishLock())) return { ok: false, error: 'A publish is already in progress.' };
    try {
      const [target] = await db.select().from(snapshots).where(eq(snapshots.id, snapshotId));
      if (!target) return { ok: false, error: 'Snapshot not found.' };
      if (target.status === 'error') return { ok: false, error: 'This snapshot never went live and cannot be restored.' };

      const content = siteContentSchema.parse(target.content);
      const data = await deliver(content, 'revert', user, `Revert to snapshot #${snapshotId}`);
      await db.update(contentState)
        .set({ publishedVersion: content.version, lastPublishedAt: new Date(), lastPublishedBy: user.id })
        .where(eq(contentState.id, 1));
      await afterMutation({
        user, action: 'revert', entity: 'snapshot', entityId: String(snapshotId),
        meta: { newSnapshotId: data.snapshotId, commitSha: data.commitSha },
        paths: ['/admin', '/admin/publish'], content: false,
      });
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e instanceof PublishError ? e.message : 'Revert failed. The live site was not changed.' };
    } finally {
      await releasePublishLock();
    }
  });
}
```

### 13.7 Revert behavior

- Revert is a **forward revert**: the old snapshot is published again as a **new** commit/snapshot. Git history stays linear and nothing is rewritten.
- By default revert changes **only the live site**. The drafts in the database keep the newer edits, and the panel shows "Unpublished changes" again. This is intentional: the editor can fix the draft and publish again.
- Optional phase 2: "Also restore drafts to this version" (re-import the snapshot into the content tables, with a confirm dialog).
- Alternative for emergencies in static mode: Vercel Dashboard → Deployments → **Instant Rollback**. Do a normal revert afterwards so the repository matches the live site.

### 13.8 Edge cases

| Situation | Behavior |
|-----------|----------|
| Two admins press Publish together | The lock admits one. The other sees "A publish is already in progress." |
| GitHub returns 409/422 (file changed) | Re-read the SHA and retry once, then show a clear error. |
| `GITHUB_TOKEN` expired or wrong | Clear message to the admin. Nothing changes on the live site. |
| Snapshot fails Zod validation | Publish stops before committing. Fix the data that drifted from the contract. |
| Vercel build fails | Status becomes `error`. Vercel keeps serving the previous deployment. Show Retry and Revert. |
| Vercel deployment not found yet | Report `queued` and keep polling. |
| Content unchanged | "Nothing to publish" (prevents empty commits and needless builds). |
| Publish pressed in local development | Blocked unless `PUBLISH_ENABLED=true`. |
| Lock left behind by a crash | Expires automatically after `ttlSeconds` (300). |

---

## 14. Inquiries (Contact Form)

Visitors write inquiries in **every** mode, so this part is always dynamic and **never** included in a snapshot.

```typescript
// src/app/api/contact/route.ts
import { db } from '@/lib/db';
import { inquiries } from '@/lib/db/schema';
import { inquiryInputSchema } from '@/lib/validators/inquiry';
import { limit } from '@/lib/rate-limit';   // Upstash Ratelimit wrapper: limit(key) → { success }

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!(await limit(`contact:${ip}`)).success) return Response.json({ error: 'Too many requests' }, { status: 429 });

  const parsed = inquiryInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 });

  const { website, ...data } = parsed.data;                 // `website` is a hidden honeypot field
  if (website) return Response.json({ ok: true });          // Bots get a fake success

  await db.insert(inquiries).values(data);
  // Optional: send a notification email (Resend, Postmark) to the owner
  return Response.json({ ok: true });
}
```

**Rules:** honeypot field, rate limit (for example 5 per hour per IP), message length limit (≤ 5,000 characters), trim and validate email, never echo input back as HTML. Admin workflow: `new → in_review → replied → archived`, with internal `notes`. Inquiry actions call `afterMutation({ content: false })`.

---

## 15. Routes & Actions Reference

| Name | Type | Min role | Purpose |
|------|------|----------|---------|
| `createX / updateX / deleteX` | Server Action | editor / editor / superadmin | Content CRUD per section |
| `duplicateX`, `toggleX`, `reorderX`, `bulkX` | Server Action | editor (bulk delete: superadmin) | Table operations |
| `updateSettings(key, value)` | Server Action | editor | Settings and SEO |
| `registerMedia`, `updateMediaAlt`, `deleteMedia` | Server Action | editor / editor / superadmin | Media library |
| `updateInquiry(id, status, notes)`, `deleteInquiry` | Server Action | editor / superadmin | Lead triage |
| `publishSite()` | Server Action | editor | Build and deliver a snapshot |
| `revertToSnapshot(id)` | Server Action | superadmin | Re-publish an older snapshot |
| `createUser`, `setUserRole`, `disableUser` | Server Action | superadmin | User management |
| `POST /api/auth/[...nextauth]` | Route | public | Auth.js |
| `POST /api/contact` | Route | public (rate limited) | Visitor inquiry |
| `POST /api/admin/upload` | Route | editor | Presigned upload URL |
| `GET /api/admin/publish/status?commit=` | Route | viewer | Deployment status (static) |

---

## 16. Testing & QA

### 16.1 Automated

| Level | Tool | What to cover |
|-------|------|---------------|
| Unit | Vitest | `slugify` and unique-slug logic, every Zod schema (valid, invalid, extra keys), `sameContent`, `buildContentFromDb` output validates against `siteContentSchema` |
| Integration | Vitest + test database | Each action rejects an unauthenticated user and a user with too low a role; CRUD writes an audit entry; `afterMutation` increments `draftVersion` |
| Publish (mocked) | Vitest with mocked `fetch` | GitHub 200 / 404 / 409 / 422 / 500, Vercel states, lock contention, "Nothing to publish" |
| End-to-end | Playwright | Login → create project → toggle published → publish → status reaches `ready` (against a preview or mocked API) → revert |

### 16.2 Manual QA (run in every mode you ship)

| # | Check | Expected |
|---|-------|----------|
| 1 | Open `/admin` while signed out | Redirect to `/login` |
| 2 | Call an admin action as `viewer` | Permission error, no data change |
| 3 | Create, edit, reorder, delete an item | Works. Audit log has each entry. |
| 4 | Edit an item in two browser tabs | Second save shows the "changed by someone else" error |
| 5 | Unpublished item | Not visible on the public site, not in `snapshot.json` |
| 6 | Press Publish with no changes | "Nothing to publish" |
| 7 | Press Publish after changes | Static: commit appears, deployment reaches Ready. Staged: public site updates in seconds. |
| 8 | Press Publish twice quickly | One publish runs, the other is refused |
| 9 | Revert to an older snapshot (superadmin) | Live site matches the old snapshot, new history entry, "Unpublished changes" shown |
| 10 | Revert as `editor` | Refused |
| 11 | Submit the contact form 6 times quickly | Rate limit triggers |
| 12 | Upload a 20 MB file or a `.exe` | Rejected |
| 13 | View page source of the public site | No tokens, no private fields, no admin data |
| 14 | `pnpm lint && pnpm test && pnpm build` | All pass |

---

## 17. Deployment Checklist

- [ ] Production database created (Neon). Point-in-time recovery or daily backups enabled.
- [ ] Migrations applied to production (`drizzle-kit migrate`).
- [ ] First superadmin created with `scripts/seed-admin.ts`, then the seed password removed from the environment.
- [ ] All variables from Section 6 set in Vercel (Production). `PUBLISH_ENABLED=true` in Production only.
- [ ] GitHub token created: fine-grained, one repo, **Contents: Read and write**. Expiry date noted in a calendar.
- [ ] Vercel token and `VERCEL_PROJECT_ID` created (static mode).
- [ ] Vercel project is connected to the GitHub repo with **auto-deploy on `main`**.
- [ ] `content/snapshot.json` exists in the repo with valid empty content.
- [ ] Storage bucket created, CORS allows `PUT` from the site origin, public URL configured, domain added to `next.config.ts`.
- [ ] `/admin` and `/login` are `noindex` and not in `sitemap.xml` / `robots.txt` allow lists.
- [ ] Security headers verified (securityheaders.com or browser dev tools).
- [ ] One full test publish and one revert completed in production before handing over.
- [ ] Owner has: the repo, Vercel project, database and storage credentials documented in a password manager.

**Install commands for a new project**

```bash
pnpm add drizzle-orm @neondatabase/serverless next-auth@beta bcryptjs zod server-only slugify \
  react-hook-form @hookform/resolvers @tanstack/react-table lucide-react \
  @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
pnpm add -D drizzle-kit @types/bcryptjs vitest @playwright/test tsx

npx shadcn@latest add button input textarea card table dropdown-menu dialog alert-dialog \
  badge switch tabs sonner form select checkbox skeleton
```

> `next-auth@beta` is Auth.js v5. Check whether a stable v5 tag is available and use it.

**Seed script**

```typescript
// scripts/seed-admin.ts   (run: pnpm tsx scripts/seed-admin.ts)
import bcrypt from 'bcryptjs';
import { db } from '../src/lib/db';
import { users, contentState } from '../src/lib/db/schema';

const email = process.env.SEED_ADMIN_EMAIL!;
const password = process.env.SEED_ADMIN_PASSWORD!;      // Set temporarily. Never commit.

await db.insert(users)
  .values({ email, name: 'Owner', passwordHash: await bcrypt.hash(password, 12), role: 'superadmin' })
  .onConflictDoNothing();
await db.insert(contentState).values({ id: 1 }).onConflictDoNothing();
console.log('Seeded superadmin and content_state.');
```

---

## 18. Implementation Phases

Build in this order. Do not start a phase until the previous one passes `lint`, `test` and `build`.

| Phase | Goal | Exit criteria |
|:-----:|------|---------------|
| 0 | **Bootstrap**: project, TypeScript, Tailwind, shadcn/ui, route groups `(public)` and `(admin)`, `.env.example` | App builds and runs. Admin and public layouts are separate. |
| 1 | **Database**: schema, migrations, seed script, `content_state` row | Migration applies cleanly. Seed creates a superadmin. |
| 2 | **Auth & security**: Auth.js, login page, `proxy.ts`, `requireRole`, `run`, lockout, headers | Signed-out users cannot reach `/admin`. Role checks proven by tests. |
| 3 | **Admin shell**: sidebar, topbar, dashboard skeleton, theme toggle, mobile drawer | Navigation works on mobile and desktop. |
| 4 | **First CRUD section (projects)**: list table, create, edit, delete, toggle, reorder, duplicate | All operations in 10.3 work. Audit log and `draftVersion` update. |
| 5 | **Remaining sections**: posts (with rich text), settings, other requested types | Copy the projects pattern. No new patterns invented. |
| 6 | **Media**: presigned upload, library, alt text, usage warning | Upload and reuse an image in a project. |
| 7 | **Content contract & public site**: `siteContentSchema`, `buildContentFromDb`, `getContent`, public pages using only `getContent()` | Public site renders from the chosen `CONTENT_MODE`. Private fields never appear. |
| 8 | **Publish**: lock, snapshot, mode delivery, status polling, panel, history page, revert | Passes manual QA items 5 to 10. |
| 9 | **Inquiries**: public form, rate limit, honeypot, admin inbox | Passes QA item 11. |
| 10 | **Hardening**: audit page, users page, tests, accessibility pass, security headers, noindex | Full QA table (16.2) passes. |
| 11 | **Handover**: `ADMIN_REPORT.md`, deployment checklist (Section 17) | Owner can publish and revert without help. |

---

## 19. AI Agent Prompt Template

Paste this into the agent when starting a new site. Fill the `<...>` placeholders and attach this file.

```text
NEW PROJECT: <project name>

Work ONLY inside: C:\Development\PROJECTS\<NEW_PROJECT_FOLDER>
(Create it if it does not exist.)

PROTECTED FOLDER: C:\Development\PROJECTS\JeptahPortfolio
Do not read, edit, create, delete, move, run commands in, or copy from this folder.
Before every file write or command, confirm the path is inside the new project folder.

Follow the attached ADMIN_PANEL_BLUEPRINT.md as the standard method.

Site details:
- Website type: <portfolio / agency / blog / shop / other>
- Content sections: <e.g. projects, posts, services, testimonials, team, faq>
- CONTENT_MODE: <static / staged / live>
- Roles needed: <superadmin + editor / superadmin only>
- Media storage: <Cloudflare R2 / S3 / Vercel Blob>
- Auth: <Auth.js credentials / Google login / other>
- Design notes: <colors, fonts, tone>

Process:
1. Reply first with: content types and fields, the folder tree, env vars I must create, and the phase plan.
2. Wait for my "go" before writing code.
3. Build phase by phase (Section 18). After each phase run lint, tests and build, then report in 3 lines.
4. Do not add features, libraries or content types that are not in this brief without asking.
5. Never commit secrets. Update .env.example whenever you add a variable.
6. At the end write ADMIN_REPORT.md: what was built, env vars, how to test, known limitations, and the exact steps to publish and revert.
```

---

## 20. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Publish says "Publishing is disabled" | `PUBLISH_ENABLED` is not `true` in this environment | Set it in Vercel Production only |
| "Could not read the repository" | Wrong `GITHUB_REPO`, branch, or token scope | Check repo name, branch, token has Contents read and write on that repo, token not expired |
| Commit succeeds but site does not change | Vercel is not connected to that branch, or the deploy failed | Check Vercel Git settings (production branch) and the deployment log |
| Status stays `queued` | Commit SHA not matched, wrong `VERCEL_PROJECT_ID` or `VERCEL_TEAM_ID` | Verify the IDs. Check that the deployment meta contains the commit SHA |
| "Nothing to publish" but you changed something | The change is on an unpublished item, or an inquiry/media change (not public content) | Set `published = true` on the item |
| Public site shows old data in `staged` or `live` | Cache not revalidated | Confirm `revalidateTag(CONTENT_TAG, 'max')` ran (Next.js 15: `revalidateTag(CONTENT_TAG)`) and pages use `getContent()` |
| `snapshot.json` import fails | Missing file or `resolveJsonModule` off | Commit the empty snapshot, enable `resolveJsonModule`, add the `@content/*` path alias |
| Zod error when publishing | Row data no longer matches the contract | Update `buildContentFromDb` or fix the data, never loosen the schema to hide the problem |
| Cannot reach `/admin` after login | Session cookie name differs from `proxy.ts` | Update `SESSION_COOKIES` to match Auth.js, and confirm `AUTH_SECRET` is set |
| Presigned upload fails (CORS) | Bucket CORS rules | Allow `PUT` and the `Content-Type` header from the site origin |
| Transactions fail on Neon | `neon-http` driver has no transactions | Use `neon-serverless` (WebSocket) or `pg` for those actions |
| Local dev committed to `main` | `PUBLISH_ENABLED=true` locally | Keep it `false` locally, or use a throwaway `GITHUB_BRANCH` |

---

## 21. Definition of Done

**Functional**

- [ ] Admin can create, edit, duplicate, reorder, toggle and delete content in every section.
- [ ] Media upload works and alt text is enforced for published content.
- [ ] Visitors can submit the contact form. Admin can triage inquiries.
- [ ] Publish shows live status and a final result. Revert restores a previous version.
- [ ] Changing `CONTENT_MODE` changes how content is delivered **without changing any page code**.

**Security**

- [ ] Every page, action and API route verifies the session and role on the server.
- [ ] No secret is exposed to the browser or committed to Git.
- [ ] Rate limiting on login and contact form. Input validated everywhere.
- [ ] Audit log records every mutation, publish and revert.

**Quality**

- [ ] `pnpm lint`, `pnpm test` and `pnpm build` pass.
- [ ] Manual QA table (16.2) passes in the shipped mode.
- [ ] Admin is responsive, accessible and has loading, empty and error states.
- [ ] `ADMIN_REPORT.md` is written and `.env.example` is complete.

---

## Version History

| Version | Notes |
|---------|-------|
| 2.0.0 | Added content modes (`static`, `staged`, `live`), snapshot-based publish and revert, GitHub commit and Vercel status polling, content contract, audit log, publish lock, media flow, role matrix, UI spec, QA, deployment checklist, phased plan, agent prompt template, troubleshooting. |
| 1.0.0 | Initial architecture, directory layout, schema, middleware and server-action examples. |
