# Right-Side Changelog Panel & Admin Customization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the right floating panel into a formal, simplified, authentic Changelog in singular brand color `#041a24` (mirroring the left sidebar's elegance), completely unbound from the middle content, with full CRUD customization inside the Admin Panel (`/admin`).

**Architecture:** 
- **Data Layer:** Add a `changelog_items` collection to `src/db/seeds/mock-archive.json` and extend `src/db/data-provider.ts` with typed CRUD operations backed by disk persistence and Supabase synchronization.
- **API Layer:** Create `/api/changelog` and `/api/changelog/[id]` route handlers for client-side and admin mutations.
- **Admin Studio:** Add a dedicated "Changelog" tab in `src/app/(admin)/admin/admin-manager.tsx` with creation, editing, deletion, and real-time live preview.
- **Right Rail UI:** Re-architect `src/components/navigation/right-floating-panel.tsx` into a single formal card with `#041a24` background, Newsreader masthead, vertical timeline, category badges, and eliminate all promo/ad elements.
- **Layout Integration:** Keep the panel as a completely unbound `fixed` overlay in `src/app/(public)/home/hub-layout-client.tsx`, preserving the completed Phase 57 centered middle layout (`max-w-[940px]`) and maintaining exclusions on `/home/apps`, `/home/about`, and `/home/contact`.

**Tech Stack:** Next.js 15 (App Router, React 19), TypeScript, Tailwind CSS, Lucide React, Drizzle ORM / Supabase Storage & local JSON persistence.

---

## Global Constraints

- **Color Palette:** Singular brand color `#041a24` for card surface, dark borders, and badges; `#F4F4F0` warm ivory background; white and white/70 text on dark surfaces.
- **Typography:** `font-editorial italic` (Newsreader) for mastheads, `font-mono` (Geist Mono) for dates/tags/metadata, `font-sans` (Geist) for clean body and headings.
- **Layout Integrity:** The middle reading column (`max-w-[940px] mx-auto` with `xl:pr-56` wrapper) MUST remain 100% untouched and unmoved.
- **Route Exclusions:** The right changelog panel must NOT appear on `/home/apps`, `/home/about`, or `/home/contact`.

---

## Review Focus

1. **Middle Content Independence:** Verify that adding, modifying, or resizing the right panel does not alter the middle content container's width, position, or margins by even 1 pixel.
2. **Admin Mutation Persistence:** Confirm that adding, updating, or deleting changelog entries in `/admin` immediately persists to `src/db/seeds/mock-archive.json` and updates the live right rail upon refresh without server restarts.
3. **Responsive Display:** Verify the right panel hides cleanly on viewports `< xl` (< 1280px) and floats as a fixed overlay on viewports `>= xl`.
4. **Theme Consistency:** Confirm that the `#041a24` card background, hairline borders (`border-white/10`), and Newsreader masthead match the left side panel's formality.
5. **No Visual Regressions:** Ensure the `#041a24` footer remains full-width (`w-full`) edge-to-edge without any right-side gap.

---

## Tasks

### Task 1: Data Model & Provider for Changelog Entries

**Files:**
- Modify: `src/db/data-provider.ts`
- Modify: `src/db/seeds/mock-archive.json`

- [x] **Step 1: Define `ChangelogItem` TypeScript interface**
  Add the interface in `src/db/data-provider.ts`:
  ```ts
  export interface ChangelogItem {
    id: string;
    version_tag?: string; // e.g. "v1.2.0" or "FEATURE"
    category: "feature" | "release" | "fix" | "doc" | "system";
    title: string;
    description: string;
    timestamp: string; // e.g. "8 hours ago", "Oct 23, 2026"
    href?: string;
    sort_order: number;
    created_at: string;
  }
  ```

- [x] **Step 2: Seed initial formal changelog entries in `mock-archive.json`**
  Add `changelog_items` array in `src/db/seeds/mock-archive.json` documenting real repository milestones:
  - `v1.2.4` - Authentic circular GitHub profile avatar integration across hero, sidebar, and community feed
  - `v1.2.3` - Responsive sidebar width refinement and balanced optical screen centering
  - `v1.2.2` - GPU-accelerated botanical silk wave WebGL shader on entry hero
  - `v1.2.1` - Editorial typography alignment and @websiteBlog verified identity
  - `v1.2.0` - Initial public archive launch with multi-format notes & documentation stream

- [x] **Step 3: Implement CRUD operations in `data-provider.ts`**
  Implement:
  - `getChangelogItems(): Promise<ChangelogItem[]>` (sorted by `sort_order` or `created_at` desc)
  - `createChangelogItem(item: Omit<ChangelogItem, "id" | "created_at">): Promise<ChangelogItem>`
  - `updateChangelogItem(id: string, updates: Partial<ChangelogItem>): Promise<ChangelogItem | null>`
  - `deleteChangelogItem(id: string): Promise<boolean>`
  All write operations call `persistCachedArchive()`.

- [x] **Step 4: Verify with `npx tsc --noEmit`**
  Ensure zero TypeScript errors.

---

### Task 2: API Route Handlers for Changelog Mutations

**Files:**
- Create: `src/app/api/changelog/route.ts`
- Create: `src/app/api/changelog/[id]/route.ts`

- [x] **Step 1: Build `GET` and `POST` in `/api/changelog/route.ts`**
  - `GET`: Returns `{ success: true, items: ChangelogItem[] }`
  - `POST`: Validates payload (`title`, `description`, `timestamp`, `category`, `version_tag`), calls `createChangelogItem`, returns created item.

- [x] **Step 2: Build `PUT` and `DELETE` in `/api/changelog/[id]/route.ts`**
  - `PUT`: Updates existing entry fields and calls `updateChangelogItem`.
  - `DELETE`: Calls `deleteChangelogItem` and returns success status.

- [x] **Step 3: Test endpoints with PowerShell `Invoke-WebRequest`**
  Confirm 200 responses on `GET /api/changelog`.

---

### Task 3: Admin Studio Changelog Management Suite

**Files:**
- Modify: `src/app/(admin)/admin/admin-manager.tsx`

- [x] **Step 1: Add "Changelog" tab to navigation in `admin-manager.tsx`**
  Add a `Changelog` tab alongside Apps, Docs, Courses, Ideas, and Resources, with an activity/history icon (`GitCommit` or `History`).

- [x] **Step 2: Build Changelog Management Panel**
  - Display a list of current changelog entries with drag/sort or chronological order.
  - Show version tag badge, timestamp, title, description, and action buttons (Edit, Delete).

- [x] **Step 3: Build "New Entry / Edit Entry" Modal Form**
  Form inputs:
  - Title (e.g. `GitHub profile avatar unified across platform`)
  - Version / Tag (e.g. `v1.2.4` or `FEATURE`)
  - Category dropdown (`Feature`, `Release`, `Fix`, `Documentation`, `System`)
  - Timestamp / Date display text (e.g. `Today`, `Oct 23`, `8 hours ago`)
  - Summary / Description (multiline textarea)
  - Optional Target Link (e.g. `/home/docs`)
  - Submit button with instant optimistic UI update.

- [x] **Step 4: Implement Delete confirmation and live reload**
  Hook to `/api/changelog/[id]` with notification toast.

- [x] **Step 5: Verify type safety with `npx tsc --noEmit`**

---

### Task 4: Redesign Right Floating Panel (`#041a24` Formal Theme)

**Files:**
- Modify: `src/components/navigation/right-floating-panel.tsx`
- Modify: `src/lib/floating-panel-data.ts`

- [x] **Step 1: Remove unnecessary promotional and ad elements**
  - Remove the "UNIVERSE'26" gaming block graphic, peeking mascot, and "Save your seat" button.
  - Simplify into a single, cohesive, formal changelog card.

- [x] **Step 2: Apply the `#041a24` Formal Theme**
  - Card background: `bg-[#041a24]` (solid, rich dark midnight).
  - Borders: `border border-white/10` with subtle elevation `shadow-md rounded-[8px]`.
  - Header:
    - Left: Newsreader Italic title `System Changelog` (`font-editorial italic text-base text-white font-normal`).
    - Right: Active live status indicator (`span.w-1.5.h-1.5.rounded-full.bg-emerald-400.animate-pulse` + `LIVE`).
    - Hairline divider below header: `border-b border-white/10 pb-3`.

- [x] **Step 3: Build the Formal Timeline Stream**
  - Vertical guideline: `border-l border-white/15 ml-1.5 pl-3.5 space-y-4`.
  - Node indicators: `w-2 h-2 rounded-full bg-sky-400 ring-2 ring-[#041a24]`.
  - Entry Header:
    - Monospace relative timestamp: `font-mono text-[10px] text-white/50 uppercase tracking-wider`.
    - Tag badge: `text-[9px] font-mono px-1 py-0.2 rounded-[2px] bg-white/10 text-white/80 font-semibold`.
  - Entry Title: `text-xs font-sans font-medium text-white hover:text-sky-300 leading-snug transition-colors`.
  - Entry Description: `text-[11px] text-white/65 leading-normal line-clamp-2 mt-0.5`.

- [x] **Step 4: Add Card Footer**
  - Discrete bottom row with total log count, e.g. `● 5 Milestones Recorded`.
  - Subtle link to view all archive notes: `View Full Archive →` (`font-mono text-[10px] text-white/50 hover:text-white`).

- [x] **Step 5: Connect to Live Data Source**
  - Fetch entries from `/api/changelog` with fallback to `mock-archive.json`.
  - Automatic revalidation so admin edits reflect immediately.

---

### Task 5: Layout Verification & Exclusions

**Files:**
- Verify: `src/app/(public)/home/hub-layout-client.tsx`

- [x] **Step 1: Verify Middle Content Isolation**
  - Confirm `<main>` preserves `lg:pl-56 pr-0`.
  - Confirm middle content wrapper preserves `w-full flex-1 flex flex-col ${sidebarCollapsed ? "" : "xl:pr-56"}` and `max-w-[940px] mx-auto`.
  - Confirm right rail is placed in-page naturally (`absolute right-4 lg:right-6 2xl:right-8 top-8 sm:top-10 md:top-12 w-[270px]`) so it moves on scroll without displacing middle content.

- [x] **Step 2: Verify Route Exclusions**
  - Test `/home/apps` (Projects): Right rail is 100% hidden.
  - Test `/home/about` (About): Right rail is 100% hidden.
  - Test `/home/contact` (Contact): Right rail is 100% hidden.
  - Test `/home`, `/home/docs`, `/home/courses`, `/home/ideas`, `/home/resources`: Right rail displays cleanly on desktop.

- [x] **Step 3: Verification Suite**
  - Run `npx tsc --noEmit` (0 errors).
  - Verify HTTP 200 on all public and admin routes.
  - Commit and push to GitHub `origin/main`.
