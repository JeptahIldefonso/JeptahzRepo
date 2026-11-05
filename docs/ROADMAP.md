# JeptahzRepo: Implementation Roadmap & Milestones

This document tracks progress across all engineering phases from initial scaffolding to production deployment.

---

## 🗺️ Execution Milestones

### Milestone 1: Project Scaffolding & Design System Setup
- [x] Create core markdown specifications (`README.md`, `ARCHITECTURE.md`, `SCHEMA.md`, `DESIGN_SYSTEM.md`, `ROADMAP.md`).
- [ ] Initialize Next.js 15 (React 19, TypeScript, App Router).
- [ ] Install core dependencies (`tailwindcss`, `@radix-ui/react-*`, `lucide-react`, `drizzle-orm`, `postgres`, `@supabase/ssr`, `@supabase/supabase-js`, `clsx`, `tailwind-merge`).
- [ ] Configure `globals.css` with exact monochrome raw luxury CSS variables (`#F5F5F3`, `#0A0A0A`, hairline borders).
- [ ] Build atomic anti-slop primitives (`Button`, `Badge`, `Skeleton`, `EmptyState`, `ErrorState`, `Modal`).

### Milestone 2: Database Layer & Resilient Data Provider
- [ ] Write `001_initial_schema.sql` migration in `src/db/migrations/`.
- [ ] Define Drizzle ORM TypeScript schema in `src/db/schema.ts`.
- [ ] Create `mock-archive.json` seed data for instant offline / failover fallback.
- [ ] Implement `src/db/data-provider.ts` (Supabase ➔ Local Seed Fallback).
- [ ] Create Supabase server/client utilities and `.env.example`.

### Milestone 3: Ambient Botanical Intro (Feature 2)
- [ ] Implement `botanical-canvas.tsx` with 60fps kinetic leaf drift and mouse cursor interaction.
- [ ] Build `intro-hero.tsx` with welcoming headline and "Visit Community" button.
- [ ] Configure root entry page `/` (`src/app/page.tsx`).

### Milestone 4: Persistent Editorial Sidebar & Navigation Core (Feature 4)
- [ ] Build fixed desktop sidebar and responsive mobile drawer (`src/components/navigation/sidebar.tsx`).
- [ ] Implement active indicator tabs with real-time item counts.
- [ ] Build `/home` layout shell (`src/app/(public)/home/layout.tsx`).
- [ ] Build Command Center Overview dashboard (`src/app/(public)/home/page.tsx`).
- [ ] Implement quick search command dialog (`Cmd+K`).

### Milestone 5: Apps Showcase with Carousel & GDrive Install (Feature 3)
- [ ] Build multi-image interactive screenshot carousel (`src/components/apps/app-carousel.tsx`).
- [ ] Build Google Drive install instruction & download modal (`src/components/apps/install-modal.tsx`).
- [ ] Build `/home/apps` showcase gallery page and individual app detail pages.

### Milestone 6: Multi-Format Computer Science Repository (Feature 1)
- [ ] Build `/home/docs`: Markdown documentation & theory reader.
- [ ] Build `/home/courses`: University curricula & study roadmap viewer.
- [ ] Build `/home/projects`: Code repositories, assignments, and downloadable assets.
- [ ] Build `/home/resources`: Curated developer bookmarks & papers.
- [ ] Build `/home/ideas`: Raw thought bank & brainstorming logs.
- [ ] Build `/home/about` & `/home/contact`: Biography and direct channels.

### Milestone 7: Admin Studio & Management Suite
- [ ] Build monochromatic credentials gateway at `/login`.
- [ ] Build `/admin` dashboard overview with metrics.
- [ ] Build CRUD forms for entries, apps, and topics.
- [ ] Implement drag-and-drop file uploader for Supabase Storage.
- [ ] Secure all admin mutations with Supabase Auth and RLS.

### Milestone 8: Verification, Anti-Slop Audit & Production Readiness
- [ ] Verify zero TypeScript errors (`tsc --noEmit`).
- [ ] Test production build (`next build`).
- [ ] Verify responsive layouts on mobile, tablet, and wide desktop screens.
- [ ] Ensure loading skeletons, empty states, and error boundaries are mounted on all views.
