# Reusable Blueprint: Static Snapshot + Git-Driven Publishing Engine for Next.js & Vercel

> **Purpose**: A complete, self-contained architectural guide and code template to replicate the **Draft Database &rarr; Git Snapshot Commit &rarr; Automated Vercel Build &rarr; Static Edge CDN** publishing architecture in any future Next.js web application.

---

## 1. High-Level Architecture & Why This Pattern Wins

Traditional dynamic web applications query databases on every request or rely on complex caching and ISR layers that can still suffer from database connection limits, cold starts, and egress costs. 

This architecture provides the best of both worlds:
1. **CMS/Admin Experience**: Admins perform standard CRUD operations against a live database (Postgres, Supabase, Neon, Firestore, etc.) with real-time draft previews.
2. **Instant & Resilient Public Site**: The public site is **100% statically prerendered (`SSG`)**. It reads strictly from a committed local JSON file (`content/snapshot.json`) without any database connections at runtime or build time.
3. **Automated Git-Driven Deployment**: Clicking **"PUBLISH"** snapshots the database state, serializes it deterministically, commits it directly to the repository's `main` branch via the GitHub Contents API, and lets Vercel's native Git integration trigger an automatic production build.
4. **Instant Auditing & Rollback**: Every published version is an immutable Git commit with a 12-character SHA-256 hash. Reverting is a safe forward commit restoring the previous snapshot.

```
 +-----------------------------------------------------------------------------------+
 | ADMIN STUDIO (Authenticated Admin)                                                |
 |                                                                                   |
 |  [ Admin Edits / CRUD ] ---> [ Postgres / Supabase Draft DB ]                     |
 |                                      |                                            |
 |                                      v                                            |
 |                         [ Compute Saved SHA-256 Hash ]                            |
 |                                      |                                            |
 |               +----------------------+----------------------+                     |
 |               |                                             |                     |
 |     (Saved Hash != Live Hash)                     (Saved Hash == Live Hash)       |
 |               |                                             |                     |
 |               v                                             v                     |
 |      Badge: "Unpublished changes"               Badge: "Live and up to date"      |
 |      Button: [PUBLISH] (Active)                 Button: [PUBLISH] (Disabled)      |
 +---------------+-------------------------------------------------------------------+
                 |
                 | Click "PUBLISH"
                 v
 +-----------------------------------------------------------------------------------+
 | PUBLISH ENGINE (Server-Side)                                                      |
 |                                                                                   |
 |  1. Enforce Auth & CSRF Guard                                                     |
 |  2. Acquire In-Memory Mutex + Atomic Database Lock (state = 'in_flight')          |
 |  3. Auto-recover Stale Locks (clears any orphaned locks older than 15 minutes)    |
 |  4. Referential Gate (validate all uploaded media assets exist in storage)        |
 |  5. PUT /repos/{owner}/{repo}/contents/content/snapshot.json (GitHub API)         |
 |  6. Record Commit SHA in DB                                                       |
 +---------------+-------------------------------------------------------------------+
                 |
                 | GitHub Webhook
                 v
 +-----------------------------------------------------------------------------------+
 | VERCEL CI / CD PIPELINE                                                           |
 |                                                                                   |
 |  1. Detects commit on 'main' branch                                               |
 |  2. Runs static build: next build (guarded by no-net-guard.cjs)                   |
 |  3. Validates content/snapshot.json schema                                        |
 |  4. Generates 100% static HTML/RSC pages                                          |
 |  5. Deploys to Global Edge CDN                                                    |
 +---------------+-------------------------------------------------------------------+
                 |
                 | Polling Vercel Deployments API (every 3 seconds)
                 v
 +-----------------------------------------------------------------------------------+
 | LIVE STATUS RECONCILIATION                                                        |
 |                                                                                   |
 |  Deployment = 'READY'  ---> UI turns Green ("Live and up to date"), Hashes Match  |
 |  Deployment = 'ERROR'  ---> UI turns Red ("Publish failed"), Displays error       |
 +-----------------------------------------------------------------------------------+
```

---

## 2. Core Components Overview

| Component | File Path | Role |
|---|---|---|
| **Snapshot Schema & Hash** | `src/lib/snapshot-schema.ts` | Validates snapshot structure, deterministic sorting, and 12-char SHA-256 hash. |
| **Database Schema** | `src/server/db/schema.ts` | Stores live draft entities + `publish_status` table for locking and history. |
| **Network Build Guard** | `scripts/no-net-guard.cjs` | Monkey-patches Node `net` and `dns` to abort build if any static page contacts the network. |
| **GitHub Contents API** | `src/server/publish/github.ts` | Reads remote file, creates atomic commit, fetches history, redacts tokens. |
| **Vercel Deployments API** | `src/server/publish/vercel.ts` | Queries Vercel API, matches `meta.githubCommitSha` to track exact build progress. |
| **Publish Engine** | `src/server/publish/publish.ts` | Manages mutex, stale-lock recovery, reconciliation, publish and revert transactions. |
| **API Endpoints** | `src/app/api/admin/publish/...` | Protected endpoints (`/status`, `/publish`, `/revert`). |
| **Admin UI Component** | `src/components/admin/publish-panel.tsx` | Visual dashboard: badges, monospace hash chips, confirmation modals, polling. |

---

## 3. Step-by-Step Implementation Guide

### Step 1: Database Schema (`publish_status` Table)

Create a singleton table (ID = 1) in your database (Drizzle ORM example):

```typescript
// src/server/db/schema.ts
import { pgTable, serial, varchar, timestamp, text } from 'drizzle-orm/pg-core';

export const publishStatus = pgTable('publish_status', {
  id: serial('id').primaryKey(),
  state: varchar('state', { length: 32 }).notNull().default('idle'), // 'idle' | 'in_flight' | 'failed'
  committedHash: varchar('committed_hash', { length: 64 }),
  committedBlobSha: varchar('committed_blob_sha', { length: 64 }),
  previousHash: varchar('previous_hash', { length: 64 }),
  previousBlobSha: varchar('previous_blob_sha', { length: 64 }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  lastError: text('last_error'),
});
```

---

### Step 2: Deterministic Snapshot Schema & Hashing

To avoid false "Unpublished changes", the JSON serialization must be **100% deterministic** (keys sorted recursively, date fields that change per build excluded from hash).

```typescript
// src/lib/snapshot-schema.ts
import { z } from 'zod';
import { createHash } from 'node:crypto';

export const SCHEMA_VERSION = 1;

export const SnapshotSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  generatedAt: z.string(), // ISO date
  siteSettings: z.object({
    siteTitle: z.string(),
    tagline: z.string().optional(),
  }),
  projects: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
      summary: z.string(),
      featured: z.boolean(),
    })
  ),
  assets: z.record(z.string(), z.string()), // key -> URL mapping
});

export type Snapshot = z.infer<typeof SnapshotSchema>;

/**
 * Sorts all object keys alphabetically so JSON output is byte-for-byte identical
 * regardless of insertion order.
 */
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object' && value.constructor === Object) {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortKeys((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

export function serializeSnapshot(snapshot: Snapshot): string {
  return JSON.stringify(sortKeys(snapshot), null, 2) + '\n';
}

/**
 * Computes a 12-character SHA-256 hash of the content, omitting 'generatedAt'
 * so rebuilding without edits produces the exact same hash.
 */
export function contentHash(snapshot: Snapshot): string {
  const { generatedAt: _, ...contentWithoutDate } = snapshot;
  const canonical = JSON.stringify(sortKeys(contentWithoutDate));
  return createHash('sha256').update(canonical).digest('hex').slice(0, 12);
}
```

---

### Step 3: Network Build Guard (Guaranteeing Zero Runtime DB Calls)

Place this script in `scripts/no-net-guard.cjs`. During `next build`, it intercepts socket connections and immediately throws an error if any public page tries to query a database:

```javascript
// scripts/no-net-guard.cjs
const net = require('node:net');
const dns = require('node:dns');

if (process.env.PORTFOLIO_BUILD === '1') {
  const origConnect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function (...args) {
    const err = new Error(
      'BUILD TIME ERROR: Network access attempted during static generation! ' +
      'Public pages must read exclusively from content/snapshot.json.'
    );
    console.error(err.stack);
    process.exit(1);
  };
}
```

In `package.json`:
```json
{
  "scripts": {
    "build": "tsx scripts/validate-snapshot.ts && cross-env PORTFOLIO_BUILD=1 NODE_OPTIONS=--require=./scripts/no-net-guard.cjs next build"
  }
}
```

---

### Step 4: GitHub API Client (`github.ts`)

Commits the updated `content/snapshot.json` to the target branch using the GitHub Contents API (`PUT /contents/{path}`), fetches commit history, and includes **strict token sanitization**.

```typescript
// src/server/publish/github.ts
const API = 'https://api.github.com';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export function sanitizeError(msg: string): string {
  if (!msg) return msg;
  let sanitized = msg
    .replace(/ghp_[a-zA-Z0-9]{20,}/g, '[REDACTED]')
    .replace(/github_pat_[a-zA-Z0-9_]{30,}/g, '[REDACTED]')
    .replace(/Bearer\s+[a-zA-Z0-9_.-]+/gi, 'Bearer [REDACTED]');

  const ghToken = process.env.GITHUB_TOKEN;
  if (ghToken && ghToken.length > 5) sanitized = sanitized.split(ghToken).join('[REDACTED]');
  const vToken = process.env.VERCEL_TOKEN;
  if (vToken && vToken.length > 5) sanitized = sanitized.split(vToken).join('[REDACTED]');
  return sanitized;
}

export function githubConfig(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    throw new Error('GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO must be set.');
  }

  return {
    token,
    owner,
    repo,
    branch: process.env.GITHUB_BRANCH ?? 'main',
    path: 'content/snapshot.json',
  };
}

function headers(cfg: GitHubConfig): HeadersInit {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

export async function readRemoteSnapshot(cfg: GitHubConfig) {
  const url = `${API}/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}?ref=${encodeURIComponent(cfg.branch)}`;
  const res = await fetch(url, { headers: headers(cfg), cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed: ${sanitizeError(await res.text())}`);

  const body = await res.json();
  return {
    content: Buffer.from(body.content, 'base64').toString('utf8'),
    blobSha: body.sha as string,
  };
}

export async function readRemoteSnapshotAtRef(cfg: GitHubConfig, ref: string) {
  const url = `${API}/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}?ref=${encodeURIComponent(ref)}`;
  const res = await fetch(url, { headers: headers(cfg), cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read at ref failed: ${sanitizeError(await res.text())}`);

  const body = await res.json();
  return {
    content: Buffer.from(body.content, 'base64').toString('utf8'),
    blobSha: body.sha as string,
  };
}

export async function getPublishHistory(cfg: GitHubConfig, limit = 10) {
  const url = `${API}/repos/${cfg.owner}/${cfg.repo}/commits?path=${encodeURIComponent(cfg.path)}&sha=${encodeURIComponent(cfg.branch)}&per_page=${limit}`;
  const res = await fetch(url, { headers: headers(cfg), cache: 'no-store' });
  if (!res.ok) return [];

  const commits = await res.json();
  if (!Array.isArray(commits)) return [];

  return commits.map((c: any) => {
    const msg = c.commit?.message || '';
    const match = msg.match(/snapshot\s+([a-f0-9]{12,64})/i);
    return {
      commitSha: c.sha as string,
      hash: match && match[1] ? match[1].slice(0, 12) : c.sha.slice(0, 12),
      timestamp: c.commit?.committer?.date || new Date().toISOString(),
      message: msg,
    };
  });
}

export async function commitSnapshot(
  cfg: GitHubConfig,
  json: string,
  blobSha: string | null,
  message: string
): Promise<{ commitSha: string; blobSha: string }> {
  const url = `${API}/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: headers(cfg),
    cache: 'no-store',
    body: JSON.stringify({
      message,
      content: Buffer.from(json, 'utf8').toString('base64'),
      branch: cfg.branch,
      ...(blobSha ? { sha: blobSha } : {}),
    }),
  });

  if (res.status === 409) {
    throw new Error('Snapshot changed remotely. Please reload admin to reconcile.');
  }
  if (!res.ok) {
    throw new Error(`GitHub commit failed: ${sanitizeError(await res.text())}`);
  }

  const body = await res.json();
  return { commitSha: body.commit.sha, blobSha: body.content.sha };
}
```

---

### Step 5: Vercel Deployments Client (`vercel.ts`)

Queries the Vercel Deployments API to follow the specific build tied to the generated Git commit SHA:

```typescript
// src/server/publish/vercel.ts
export interface VercelConfig {
  token: string;
  projectId: string;
  teamId?: string;
}

export function vercelConfig(): VercelConfig | null {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return null;
  return { token, projectId, teamId: process.env.VERCEL_TEAM_ID };
}

export type VercelState = 'INITIALIZING' | 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED' | 'UNKNOWN';

export async function getDeploymentForCommit(commitSha: string) {
  const cfg = vercelConfig();
  if (!cfg) return null;

  try {
    const url = new URL('https://api.vercel.com/v6/deployments');
    url.searchParams.set('projectId', cfg.projectId);
    if (cfg.teamId) url.searchParams.set('teamId', cfg.teamId);
    url.searchParams.set('limit', '20');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${cfg.token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const data = await res.json();
    const deployments = data.deployments || [];

    // STRICT MATCH: Match meta.githubCommitSha against target commitSha
    const matching = deployments.find((d: any) => {
      const deployCommit = d.meta?.githubCommitSha || d.meta?.commitSha;
      return deployCommit && deployCommit.toLowerCase() === commitSha.toLowerCase();
    });

    if (!matching) return null;

    const rawState = (matching.state || matching.readyState || 'UNKNOWN').toUpperCase();
    const state: VercelState = ['INITIALIZING', 'QUEUED', 'BUILDING', 'READY', 'ERROR', 'CANCELED'].includes(rawState)
      ? (rawState as VercelState)
      : 'UNKNOWN';

    return {
      id: matching.uid || matching.id,
      url: matching.url ? `https://${matching.url}` : null,
      state,
      commitSha,
      createdAt: matching.createdAt || Date.now(),
    };
  } catch (err) {
    console.error('Failed to query Vercel API:', err);
    return null;
  }
}
```

---

### Step 6: The Publish Engine & State Machine (`publish.ts`)

Implements the complete synchronization logic:
1. Process mutex + Atomic SQL lock (`state != 'in_flight'`).
2. Stale-lock threshold (15 minutes).
3. Hash-skip for unchanged content (`liveHash === savedHash`).
4. Revert through forward Git commit.
5. Error token redaction.

```typescript
// src/server/publish/publish.ts
import { eq, and, ne } from 'drizzle-orm';
import { db } from '@/server/db';
import { publishStatus } from '@/server/db/schema';
import {
  githubConfig,
  readRemoteSnapshot,
  readRemoteSnapshotAtRef,
  commitSnapshot,
  getPublishHistory,
  sanitizeError,
} from './github';
import { vercelConfig, getDeploymentForCommit } from './vercel';
import { serializeSnapshot, contentHash, SnapshotSchema } from '@/lib/snapshot-schema';

let isPublishLocked = false;
let inFlightCommitSha: string | null = null;
const STALE_LOCK_MS = 15 * 60 * 1000; // 15-minute lock expiry

export async function publish() {
  if (isPublishLocked) {
    return { status: 'error', message: 'A publish is already in progress.' };
  }

  isPublishLocked = true;
  try {
    const cfg = githubConfig();

    // 1. Reconcile database state & detect stale locks
    const [status] = await db.select().from(publishStatus).where(eq(publishStatus.id, 1));

    if (status?.state === 'in_flight') {
      const started = status.startedAt ? new Date(status.startedAt).getTime() : 0;
      const isStale = started === 0 || Date.now() - started > STALE_LOCK_MS;

      if (!isStale) {
        return { status: 'error', message: 'A publish is already running on another instance.' };
      }

      // Expired lock recovery
      await db.update(publishStatus).set({ state: 'idle', lastError: 'Stale lock cleared.' }).where(eq(publishStatus.id, 1));
    }

    const remote = await readRemoteSnapshot(cfg);
    const draftSnapshot = await buildSnapshotFromDb();
    const hash = contentHash(draftSnapshot);
    const liveHash = remote ? contentHash(JSON.parse(remote.content)) : status?.committedHash;

    // 2. Hash Skip: Prevent empty commits if nothing changed
    if (liveHash === hash) {
      return { status: 'no_change', hash };
    }

    // 3. Atomic Database Claim
    const [claimed] = await db
      .update(publishStatus)
      .set({
        state: 'in_flight',
        committedHash: hash,
        previousHash: liveHash,
        previousBlobSha: remote?.blobSha,
        startedAt: new Date(),
        finishedAt: null,
        lastError: null,
      })
      .where(and(eq(publishStatus.id, 1), ne(publishStatus.state, 'in_flight')))
      .returning();

    if (!claimed) {
      return { status: 'error', message: 'Concurrent publish blocked by database lock.' };
    }

    // 4. Commit snapshot to GitHub
    const json = serializeSnapshot(draftSnapshot);
    const { commitSha, blobSha } = await commitSnapshot(
      cfg,
      json,
      remote?.blobSha ?? null,
      `content: publish snapshot ${hash}`
    );

    inFlightCommitSha = commitSha;

    // If no Vercel token is configured, complete immediately
    if (!vercelConfig()) {
      await db.update(publishStatus).set({ state: 'idle', finishedAt: new Date() }).where(eq(publishStatus.id, 1));
    }

    return { status: 'published', commitSha, hash };
  } catch (err: any) {
    const message = sanitizeError(err.message || String(err));
    await db.update(publishStatus).set({ state: 'failed', lastError: message, finishedAt: new Date() }).where(eq(publishStatus.id, 1));
    return { status: 'error', message };
  } finally {
    isPublishLocked = false;
  }
}

export async function revertToPrevious() {
  if (isPublishLocked) return { status: 'error', message: 'Publish in progress.' };
  isPublishLocked = true;

  try {
    const cfg = githubConfig();
    const history = await getPublishHistory(cfg, 5);

    if (history.length < 2) {
      return { status: 'error', message: 'No previous snapshot found in history to revert to.' };
    }

    const prevCommit = history[1].commitSha;
    const prevFile = await readRemoteSnapshotAtRef(cfg, prevCommit);
    if (!prevFile) throw new Error('Could not read snapshot from target commit.');

    const remote = await readRemoteSnapshot(cfg);
    const parsed = SnapshotSchema.parse(JSON.parse(prevFile.content));
    const revertHash = contentHash(parsed);

    // Commit revert as a forward commit
    const { commitSha } = await commitSnapshot(
      cfg,
      prevFile.content,
      remote?.blobSha ?? null,
      `content: revert snapshot to ${revertHash}`
    );

    inFlightCommitSha = commitSha;
    await db.update(publishStatus).set({ state: 'in_flight', startedAt: new Date() }).where(eq(publishStatus.id, 1));

    return { status: 'published', commitSha, hash: revertHash };
  } catch (err: any) {
    const message = sanitizeError(err.message || String(err));
    return { status: 'error', message };
  } finally {
    isPublishLocked = false;
  }
}

export async function getDetailedPublishStatus() {
  const cfg = githubConfig();
  const [status] = await db.select().from(publishStatus).where(eq(publishStatus.id, 1));
  const draft = await buildSnapshotFromDb();
  const savedHash = contentHash(draft);

  const remote = await readRemoteSnapshot(cfg);
  const liveHash = remote ? contentHash(JSON.parse(remote.content)) : null;
  const history = await getPublishHistory(cfg, 10);

  let state: 'idle' | 'publishing' | 'failed' = 'idle';
  let deploymentUrl: string | null = null;
  let error = status?.lastError ?? null;

  if (status?.state === 'in_flight') {
    const started = status.startedAt ? new Date(status.startedAt).getTime() : 0;
    const isTimeout = started > 0 && Date.now() - started > 10 * 60 * 1000;

    if (isTimeout) {
      state = 'failed';
      error = 'Publish timed out after 10 minutes.';
      await db.update(publishStatus).set({ state: 'failed', lastError: error }).where(eq(publishStatus.id, 1));
    } else {
      state = 'publishing';
      const commitSha = inFlightCommitSha || (history[0]?.commitSha ?? null);
      if (commitSha) {
        const deploy = await getDeploymentForCommit(commitSha);
        if (deploy) {
          deploymentUrl = deploy.url;
          if (deploy.state === 'READY') {
            state = 'idle';
            await db.update(publishStatus).set({ state: 'idle', finishedAt: new Date(), lastError: null }).where(eq(publishStatus.id, 1));
          } else if (deploy.state === 'ERROR' || deploy.state === 'CANCELED') {
            state = 'failed';
            error = `Vercel build failed (${deploy.state}).`;
            await db.update(publishStatus).set({ state: 'failed', lastError: error }).where(eq(publishStatus.id, 1));
          }
        }
      }
    }
  }

  return {
    savedHash,
    liveHash,
    state,
    canRevert: history.length > 1 && state !== 'publishing',
    deploymentUrl,
    error,
    history,
  };
}
```

---

### Step 7: Protected API Routes

Expose authenticated endpoints for the frontend panel:

```typescript
// src/app/api/admin/publish/route.ts
import { NextResponse } from 'next/server';
import { publish } from '@/server/publish/publish';
import { requireAdminAuth } from '@/server/auth';

export async function POST(req: Request) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await publish();
  return NextResponse.json(result);
}

// src/app/api/admin/publish/status/route.ts
import { NextResponse } from 'next/server';
import { getDetailedPublishStatus } from '@/server/publish/publish';
import { requireAdminAuth } from '@/server/auth';

export async function GET(req: Request) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const status = await getDetailedPublishStatus();
  return NextResponse.json(status);
}

// src/app/api/admin/publish/revert/route.ts
import { NextResponse } from 'next/server';
import { revertToPrevious } from '@/server/publish/publish';
import { requireAdminAuth } from '@/server/auth';

export async function POST(req: Request) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await revertToPrevious();
  return NextResponse.json(result);
}
```

---

### Step 8: Frontend Publish Card (`publish-panel.tsx`)

Build the user interface with status badges, monospace chips, confirmation dialogs, and 3-second live polling:

```tsx
// src/components/admin/publish-panel.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';

interface PublishState {
  liveHash: string | null;
  savedHash: string;
  state: 'idle' | 'publishing' | 'failed';
  canRevert: boolean;
  error: string | null;
}

export function PublishPanel() {
  const [data, setData] = useState<PublishState | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/publish/status');
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Poll status every 3 seconds while publishing
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, data?.state === 'publishing' ? 3000 : 15000);
    return () => clearInterval(interval);
  }, [fetchStatus, data?.state]);

  const handlePublish = async () => {
    setLoading(true);
    setShowPublishModal(false);
    try {
      const res = await fetch('/api/admin/publish', { method: 'POST' });
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async () => {
    setLoading(true);
    setShowRevertModal(false);
    try {
      const res = await fetch('/api/admin/publish/revert', { method: 'POST' });
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div className="p-4 border rounded animate-pulse">Loading publish status...</div>;

  const isUpToDate = data.liveHash === data.savedHash;
  const isPublishing = data.state === 'publishing' || loading;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Publish</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isPublishing
              ? 'Deploying to Vercel and updating live site...'
              : isUpToDate
              ? 'The live site matches your saved content.'
              : 'You have unpublished changes ready to be deployed.'}
          </p>
        </div>

        {/* Status Badge */}
        <div>
          {isPublishing ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-2 h-2 mr-1.5 bg-blue-500 rounded-full animate-ping" />
              Publishing…
            </span>
          ) : data.state === 'failed' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              Publish failed
            </span>
          ) : isUpToDate ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live and up to date
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Unpublished changes
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setShowPublishModal(true)}
          disabled={isPublishing || isUpToDate}
          className="px-5 py-2 text-xs font-bold tracking-wider uppercase rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPublishing ? 'Publishing…' : 'Publish'}
        </button>

        <button
          onClick={() => setShowRevertModal(true)}
          disabled={isPublishing || !data.canRevert}
          className="px-5 py-2 text-xs font-bold tracking-wider uppercase rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Revert to Previous
        </button>
      </div>

      <hr className="my-6 border-gray-200" />

      {/* Monospace Hash Chips */}
      <div className="flex gap-8 text-xs">
        <div>
          <div className="font-bold text-gray-500 tracking-wider uppercase mb-1">Live Content</div>
          <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono">
            {data.liveHash ?? 'none'}
          </code>
        </div>
        <div>
          <div className="font-bold text-gray-500 tracking-wider uppercase mb-1">Saved Content</div>
          <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono">
            {data.savedHash}
          </code>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showPublishModal && (
        <ConfirmDialog
          title="Publish changes?"
          body="This will create a new release commit and trigger an automated production build on Vercel."
          confirmLabel="Yes, Publish"
          onConfirm={handlePublish}
          onCancel={() => setShowPublishModal(false)}
        />
      )}

      {showRevertModal && (
        <ConfirmDialog
          title="Revert to previous snapshot?"
          body="This will restore the previous snapshot and trigger a redeployment on Vercel."
          confirmLabel="Yes, Revert"
          onConfirm={handleRevert}
          onCancel={() => setShowRevertModal(false)}
        />
      )}
    </div>
  );
}

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{body}</p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-1.5 text-sm rounded bg-gray-900 text-white hover:bg-gray-800">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Environment Variables Checklist

Add these variables to your `.env.local` and in your **Vercel Dashboard &rarr; Project Settings &rarr; Environment Variables** (Production):

```bash
# GitHub Access (Server-side only)
GITHUB_TOKEN="github_pat_xxxx"     # Fine-grained PAT scoped to repository (Contents: Read and write)
GITHUB_OWNER="YourGitHubUsername"   # e.g., JeptahIldefonso
GITHUB_REPO="YourRepositoryName"    # e.g., MyNextjsApp
GITHUB_BRANCH="main"

# Vercel Deployment Sync (Server-side only)
VERCEL_TOKEN="vercel_token_xxxx"   # Generated at https://vercel.com/account/tokens
VERCEL_PROJECT_ID="prj_xxxx"       # Found under Vercel Project Settings -> General
# VERCEL_TEAM_ID="team_xxxx"       # Only required if project belongs to a Vercel Team
```

### How to generate the GitHub Token:
1. Go to **GitHub Settings &rarr; Developer Settings &rarr; Personal Access Tokens &rarr; Fine-grained tokens**.
2. Click **Generate new token**.
3. Under **Repository access**, select **Only select repositories** and pick your repo.
4. Under **Permissions &rarr; Repository permissions**, grant **Contents: Read and write**.
5. Set an expiration (e.g., 90 days) and save the token.

### How to generate the Vercel Token:
1. Log into your Vercel dashboard and go to [vercel.com/account/tokens](https://vercel.com/account/tokens).
2. Click **Create** &rarr; Name it (e.g. `Publish Engine`) &rarr; Scope: `Full Account` or specific team.
3. In your project dashboard, go to **Settings &rarr; General** to copy the **Project ID**.

---

## 5. Verification Checklist for New Projects

When copying this pattern into a new project, verify each layer in sequence:

- [ ] **1. Determinism Test**: Snapshot serialization keys are strictly sorted. Calling `contentHash()` on the same data with different `generatedAt` timestamps produces identical 12-char hashes.
- [ ] **2. No-Op Protection**: Clicking publish with matching hashes returns `{ status: 'no_change' }` and creates no empty commits on GitHub.
- [ ] **3. Atomic Locking**: Attempting concurrent publishes is blocked both by the in-memory mutex and the SQL `WHERE state != 'in_flight'` clause.
- [ ] **4. Stale-Lock Recovery**: If an instance crashes mid-publish, in-flight records older than 15 minutes are automatically reclaimed on the next invocation.
- [ ] **5. Exact Commit Tracking**: Vercel polling matches `d.meta?.githubCommitSha.toLowerCase() === commitSha.toLowerCase()` and never takes `deployments[0]`.
- [ ] **6. Secret Hygiene**: Error messages pass through `sanitizeError()` so neither GitHub PATs nor Vercel tokens leak in logs or client responses.
- [ ] **7. Guarded Static Build**: `next build` passes with `no-net-guard.cjs`, ensuring zero network or database queries on public routes.
