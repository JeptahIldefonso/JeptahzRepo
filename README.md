# JeptahzRepo: Computer Science Knowledge Archive & Application Showcase

> **A minimal, raw luxury repository and community hub designed for Computer Science students, software architects, and builders.**  
> Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Drizzle ORM, Supabase PostgreSQL, and Vercel.

---

## 🏛️ Vision & Aesthetic Philosophy

**JeptahzRepo** bridges the gap between high-level academic theory, production software showcases, and curated engineering resources. It is crafted with a strict **Anti-Slop, Monochromatic Raw Luxury** design language:

* **Warm Gallery Canvas:** Subtle `#F5F5F3` paper tone with `#FFFFFF` raised surfaces.
* **Architectural Typography:** High-contrast Grotesk paired with razor-sharp monospace indices and timestamps.
* **Wholesome Atmosphere:** Ambient 60fps 2D Canvas "Botanical Kinetic Drift" on the welcome page that reacts organically to cursor movements.
* **Hairline Grid System:** 1px solid structural borders (`rgba(10,10,10,0.14)`) with deliberate, generous whitespace.
* **Zero UI Slop:** No generic SaaS gradients, no cartoon icons, no bubbly rounded cards, and no centered 3-card clichés.

---

## ⚡ Core Features

### 1. Ambient Welcoming Intro (`/`)
* Calming botanical falling leaves / kinetic drift animation rendered on an interactive canvas.
* Centered minimalist typography with single-action **"Visit Community"** portal transition into the main `/home` hub.

### 2. The Command Center & Sidebar (`/home`)
* Persistent editorial sidebar organized into 4 distinct zones:
  * **Command Center:** Hub overview & Application Showcase.
  * **Academic Repository:** Documentation & Theory, Course Curricula, Code Projects.
  * **Intellectual Vault:** Curated Links & Resources, Raw Ideas & Devlogs.
  * **Archival Info:** About Me & Channels.
* Real-time item count badges and mobile slide-over drawer.
* Quick-action keyboard command menu (`Cmd+K`).

### 3. Application Showcase (`/home/apps`)
* Dedicated engineering showcase for personal desktop applications, web utilities, and tools.
* Multi-image interactive screenshot carousels with zoom modal.
* Tech stack indicators, version badges (`v1.0.0`, `Beta`, `Active`).
* Instant action buttons: **View GitHub Repo** and **Install via Google Drive** with an integrated checksum & installation modal.

### 4. Multi-Format Academic Knowledge Engine
* **Docs & Theory (`/home/docs`):** Rich Markdown reader with syntax highlighting for LeetCode patterns, system design, and algorithms.
* **Courses & Syllabi (`/home/courses`):** Structured study roadmaps, recommended books, and lecture archives.
* **Downloadable Assets (`/home/projects`):** Direct Supabase Storage downloads with file size calculation and type icons.
* **Curated Bookmarks (`/home/resources`):** Clean list of verified developer utilities and papers.
* **Idea Bank (`/home/ideas`):** Raw thoughts, capstone blueprints, and devlogs.

### 5. Single-Admin Isolation & Studio (`/admin`)
* Discreet `[sys_admin]` access in the sidebar footer and `/admin` route.
* Protected by Supabase Auth and PostgreSQL Row Level Security (RLS).
* Full CRUD management: add, edit, delete, and toggle draft/publish for entries, apps, and site settings.
* Drag-and-drop file uploader directly into Supabase Storage.

### 6. Zero-Downtime Resilience & Database Portability
* **Hybrid Data Provider:** Queries Supabase PostgreSQL via Drizzle ORM.
* **Automatic Seed Fallback:** If Supabase free tier ever pauses or is offline, the site seamlessly serves local seed data (`mock-archive.json`) with zero downtime.
* **Instant Portability:** Switch between Supabase, Neon, Railway, or local Docker PostgreSQL by simply updating `DATABASE_URL`.

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (React 19, App Router) | Server Components (RSC), Streaming SSR, Edge caching |
| **Language** | TypeScript 5.x | Strict end-to-end type safety |
| **Styling** | Tailwind CSS v4 + CSS Variables | Raw luxury tokens, hairline borders, zero bloat |
| **Database** | Supabase (PostgreSQL 15+) | Relational data, RLS security, Storage buckets |
| **ORM** | Drizzle ORM | Type-safe SQL queries, migrations, multi-provider portability |
| **Auth** | Supabase Auth (`@supabase/ssr`) | Secure cookie-based single-admin authentication |
| **Motion & Canvas**| HTML5 Canvas API + Framer Motion | 60fps kinetic botanical drift & layout transitions |
| **Icons** | Lucide React | Clean, hairline stroke iconography |
| **Deployment** | Vercel (Edge / Serverless) | Global CDN, ISR caching, microsecond response times |

---

## 📂 Project Organization

```
JeptahzRepo/
├── public/                 # Static assets & favicon
├── src/
│   ├── app/
│   │   ├── page.tsx        # Ambient Botanical Intro & Portal
│   │   ├── (public)/home/  # Community Hub routes (apps, docs, courses, etc.)
│   │   ├── (admin)/        # Admin Studio (/admin) & Login (/login)
│   │   └── api/            # API Route handlers (/api/entries, /api/apps, etc.)
│   ├── components/
│   │   ├── ambient/        # Canvas drift animation & intro hero
│   │   ├── apps/           # Carousel, app cards, install modal
│   │   ├── navigation/     # Editorial sidebar, breadcrumbs, command menu
│   │   ├── entries/        # Markdown viewer, entry cards, filters
│   │   ├── admin/          # Form builders, storage dropzones
│   │   └── ui/             # Anti-slop button, badge, skeleton, empty-state
│   ├── db/
│   │   ├── migrations/     # SQL migration scripts
│   │   ├── schema.ts       # Drizzle ORM schema
│   │   ├── seeds/          # Zero-downtime mock archive fallback
│   │   └── data-provider.ts# Resilient data layer
│   └── lib/                # Supabase clients, utils, validators, constants
├── README.md               # Overview documentation
├── ARCHITECTURE.md         # Full architectural blueprint
├── SCHEMA.md               # Database schema & RLS policies
├── DESIGN_SYSTEM.md        # Monochromatic raw luxury guidelines
└── ROADMAP.md              # Milestone tracking
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/JeptahzRepo.git
cd JeptahzRepo
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
*(Note: If Supabase credentials are empty, the app automatically runs in offline resilience mode using `mock-archive.json`!)*

### 3. Run Database Migrations (Optional when connecting Supabase)
Execute `src/db/migrations/001_initial_schema.sql` in your Supabase SQL Editor.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the ambient intro, and visit [http://localhost:3000/home](http://localhost:3000/home) for the repository hub.

---

## 📄 License
MIT © Jeptah.
