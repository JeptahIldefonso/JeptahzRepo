# Changelog Banner & Stream Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the unnecessary "Banner Headline / Title" from both the admin editor and the public banner card, expand the banner image height to fill the freed vertical space, enforce a clean 3-item display limit on the right changelog rail, and provide a legitimate changelog structure.

**Architecture:** 
1. Streamline the banner card in both `RightFloatingPanel` and the admin preview in `AdminManager` by removing the text headline and increasing the image viewport from `h-[90px]` to `h-[135px]` with `object-cover`.
2. Remove the "Banner Headline / Title" text input field in `/admin` Changelog tab so admins only need to supply an image, description/subtitle, CTA button label, and destination URL.
3. Slice the changelog timeline display to a clean maximum of 3 items in `RightFloatingPanel` to prevent excessive vertical height while preserving the total milestones count and link in the footer.
4. Keep the exact outer rail dimensions (`w-[270px]`, `#041a24` background, borders) strictly unchanged.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons.

**Spec:** Direct user requirements from chat:
- Remove "Banner Headline / Title" in http://localhost:3000/admin
- Keep changelog panel size; expand image scope covering removed headline
- Enforce display of 3 changelog items on the rail
- Do not alter rail width, length, or panel sizing

---

## Global Constraints

- Panel width remains strictly `w-[270px]` on desktop screens (`hidden xl:block absolute right-4 lg:right-6 2xl:right-8`).
- Background color `#041a24` and border styles must be preserved verbatim.
- Dismiss button (`X`) functionality with localStorage persistence must continue working seamlessly.
- All existing API endpoints (`/api/changelog`, `/api/changelog-banner`, `/api/upload`) remain backward-compatible.

## Review Focus

1. **Aspect Ratio & Image Framing:** Uploaded portrait or landscape images must scale cleanly with `object-cover` without distortion at the new `h-[135px]` height.
2. **Dismiss Button Usability:** The `X` dismiss button in the top-right corner of the image must remain legible and clickable over any image contrast.
3. **Empty / Inactive State:** When the banner is toggled inactive or dismissed, the changelog container must cleanly start at the top without visual glitches.
4. **Item Count Boundary:** If there are fewer than 3 items, all available items render without breaking; if 3 or more exist, exactly the latest 3 render.
5. **Admin Form Layout:** Removing the headline input must maintain a balanced, tidy form layout in the admin manager without orphan gaps.

---

### Task 1: Update Admin Manager Banner Editor & Live Preview

**Files:**
- Modify: `src/app/(admin)/admin/admin-manager.tsx`

**Interfaces:**
- Consumes: `banner` state (`ChangelogBannerType`) and `setBanner`.
- Produces: Streamlined admin banner form without the "Banner Headline / Title" input and an updated `h-[130px]` live preview card matching the public view.

- [ ] **Step 1: Inspect form layout and remove Title input in `src/app/(admin)/admin/admin-manager.tsx`**
  - Verify that `banner.title` is no longer rendered as an input field in the Changelog tab.
  - Keep `CTA Button Text`, `Subtitle / Description Text`, `Destination URL`, and `Banner Image` upload input intact.

- [ ] **Step 2: Update the Live Rail Preview in `src/app/(admin)/admin/admin-manager.tsx`**
  - Remove `{banner.title || "BANNER TITLE"}` from the preview card body.
  - Increase image height from `h-[85px]` to `h-[130px]` with `object-cover`.
  - Ensure the dismiss button icon `✕` remains cleanly overlaid in the top-right corner.

- [ ] **Step 3: Verification**
  - Run typecheck / build or verify file syntax.
  - Ensure form save handler `handleSaveBanner` still sends valid payload to `/api/changelog-banner`.

---

### Task 2: Refine RightFloatingPanel Banner Dimensions & Changelog Item Limit

**Files:**
- Modify: `src/components/navigation/right-floating-panel.tsx`

**Interfaces:**
- Consumes: `ChangelogItem[]` and `ChangelogBannerConfig`.
- Produces: Refined rail UI displaying a taller `h-[135px]` banner image with no headline, and exactly the top 3 latest changelog items rendered in the timeline.

- [ ] **Step 1: Enlarge banner image and remove title heading in `RightFloatingPanel`**
  - In `src/components/navigation/right-floating-panel.tsx`:
    - Change image container height from `h-[90px]` to `h-[135px]`.
    - Remove `<h4 className="font-sans font-black text-sm tracking-tight text-white leading-tight">{banner.title}</h4>`.
    - Ensure `{banner.subtitle}` and CTA button render cleanly below the image with compact spacing (`p-3 space-y-2`).

- [ ] **Step 2: Enforce 3-item display limit on timeline stream**
  - In `src/components/navigation/right-floating-panel.tsx`:
    - Slice items when rendering: `items.slice(0, 3).map((item) => ...)`
    - Keep `{items.length} Milestones` in the footer counter so the total count remains accurate.
    - Keep `<Link href="/home/docs">All Docs</Link>` in footer intact.

- [ ] **Step 3: Verification**
  - Verify layout integrity and confirm only 3 items display.
  - Verify that the outer width and layout container are unchanged.

---

### Task 3: Content Quality & Seed Refinement for an Authentic Changelog

**Files:**
- Modify: `src/lib/floating-panel-data.ts`
- Modify: `src/db/seeds/mock-archive.json`

**Interfaces:**
- Produces: Polished changelog items following authentic developer changelog standards.

- [ ] **Step 1: Refine default initial items in `src/lib/floating-panel-data.ts` and `mock-archive.json`**
  - Provide authentic entries reflecting the actual codebase features:
    1. **v1.2.4 (FEATURE / Today)**: "GitHub avatar integration & authenticated author profiles across hero, sidebar, and community feed."
    2. **v1.2.3 (SYSTEM / Yesterday)**: "Optimized optical screen geometry and fluid floating navigation rail."
    3. **v1.2.2 (RELEASE / Oct 20)**: "Public archive vault release with notes, academic curriculum, and software tools."
  - Update `INITIAL_CHANGELOG_BANNER` to reflect the headline removal cleanly.

- [ ] **Step 2: Build verification**
  - Run `npx next build --no-lint` to verify full compilation with zero errors.
