# Pre-Flight Deployment Checklist & Maintenance Manual

> **JeptahzRepo Performance & Longevity System**  
> *Target Platform:* Vercel Free (Hobby) Plan  
> *Framework:* Next.js App Router (TypeScript, ISR, Static Generation)  
> *Author:* Senior Next.js Performance Engineering

---

## 1. Quick Verification Commands (Run Before Any Push)

Run these 4 commands in PowerShell from the project root (`C:\Development\PROJECTS\JeptahzRepo`):

```powershell
# 1. Typecheck & unused symbol verification (strict)
npx tsc --noEmit

# 2. Dead code & unused package audit
npm run knip

# 3. Clean production build
npm run build

# 4. Security & auth verification test script
node scripts/verify-auth.mjs
```

---

## 2. What "Good" Build Output Looks Like

When you run `npm run build`, Next.js prints a summary table of routes and shared chunks.

### A. Understanding the Route Symbols
* **`○ (Static)`** — Prerendered as pure static HTML and JSON at build time. Zero serverless execution cost on visits.
* **`● (SSG)`** — Prerendered static pages generated using `generateStaticParams()`. Served instantly from the Edge CDN.
* **`ƒ (Dynamic)`** — Serverless function executed on demand for every single request. Only mutating API routes (`/api/entries`, `/api/upload`, etc.) should have this symbol!

### B. Route Table Benchmark

Every public page on your site MUST show `○` or `●` with a `Revalidate` window (e.g., `1h`):

```text
Route (app)                               Size     First Load JS  Revalidate
┌ ○ /                                    1.51 kB         113 kB
├ ○ /_not-found                            191 B         103 kB
├ ○ /admin                               18.3 kB         152 kB
├ ƒ /api/... (All API routes)              191 B         103 kB
├ ○ /home                                  177 B         112 kB          1h
├ ○ /home/about                            171 B         106 kB          1h
├ ○ /home/apps                           3.43 kB         110 kB          1h
├ ● /home/apps/[slug]                    4.92 kB         139 kB          1h
├ ○ /home/contact                          191 B         103 kB          1h
├ ○ /home/courses                        5.87 kB         174 kB          1h
├ ● /home/courses/[slug]                   914 B         111 kB          1h
├ ○ /home/docs                           5.01 kB         173 kB          1h
├ ● /home/docs/[slug]                    2.57 kB         153 kB          1h
├ ○ /home/ideas                            191 B         103 kB          1h
├ ○ /home/projects                         191 B         103 kB
├ ● /home/projects/[slug]                  171 B         106 kB
├ ○ /home/resources                      3.56 kB         116 kB          1h
├ ○ /login                               4.93 kB         120 kB
├ ○ /robots.txt                            191 B         103 kB
└ ○ /sitemap.xml                           191 B         103 kB          1d
+ First Load JS shared by all                            103 kB
```

### C. Red Flags to Watch Out For
1. **Any public route showing `ƒ (Dynamic)` without an explicit reason:** This means a component accidentally read headers/cookies or called `fetch(..., { cache: 'no-store' })`.
2. **First Load JS exceeding 250 kB on a public page:** This indicates an uncompressed library (like three.js or framer-motion) was bundled into initial page paint.
3. **Missing `sitemap.xml` or `robots.txt`:** Both must compile as static route outputs.

---

## 3. PowerShell Security & Gateway Checks

With your dev server running (`npm run dev`), test the security boundaries using `curl.exe`:

### Check 1: Unauthenticated `/admin` must redirect to `/login` (307)
```powershell
curl.exe -I http://localhost:3000/admin
```
**Expected Output:**
```http
HTTP/1.1 307 Temporary Redirect
Location: /login?from=%2Fadmin
x-robots-tag: noindex, nofollow
```

### Check 2: Unauthenticated mutating write to `/api/entries` must return 401
```powershell
curl.exe -i -X POST http://localhost:3000/api/entries -H "Content-Type: application/json" -d "{\"title\":\"Test\"}"
```
**Expected Output:**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json
{"error":"Unauthorized: Administrator authentication required","code":"ADMIN_AUTH_REQUIRED"}
```

### Check 3: Cross-site request rejected (CSRF check)
```powershell
curl.exe -i -X POST http://localhost:3000/api/entries -H "Origin: https://malicious-site.com"
```
**Expected Output:**
```http
HTTP/1.1 403 Forbidden
Content-Type: application/json
{"error":"Forbidden: Cross-site request rejected","code":"CSRF_DETECTED"}
```

---

## 4. How to Verify Next.js Images (WebP/AVIF) in Chrome DevTools

1. Open your live site (`https://jeptahz-repo.vercel.app` or `http://localhost:3000`).
2. Press `F12` to open Chrome Developer Tools.
3. Click the **Network** tab.
4. Click the filter button **Img** (to show only image requests).
5. Right-click any column header (e.g. *Name* or *Status*) and ensure **Type** is checked.
6. Refresh the page (`Ctrl + F5` for a clean hard refresh).
7. Look at the **Type** column:
   - Optimized images served via Next.js (`/_next/image?url=...`) will display **`webp`** or **`avif`**.
   - The transfer size should be small (typically 15 kB – 45 kB for banners, < 10 kB for icons).
   - If you see a raw external URL or `png` with a multi-megabyte size, that image was not passed through Next.js `<Image />`.

---

## 5. How to Verify Static/ISR Cache (HIT vs MISS)

1. In Chrome DevTools **Network** tab, click **Doc** (or select the first document request, e.g., `/home` or `/home/docs/distributed-consensus-raft-vs-paxos`).
2. Click the request name in the list, then select the **Headers** tab on the right side.
3. Scroll to **Response Headers**:
   - **On Vercel (Production):**
     - Look for `x-vercel-cache`.
     - First visit after deploy: `x-vercel-cache: MISS` (or `STALE` while regenerating).
     - Second visit / subsequent users: `x-vercel-cache: HIT`.
     - `age`: Number of seconds the page has been cached in the edge CDN (e.g., `age: 142`).
   - **In Local Production (`npm run build` then `npm run start`):**
     - Look for `x-nextjs-cache: HIT`.
4. When `HIT` appears, Vercel serves the HTML from edge memory with 0ms serverless function execution time!

---

## 6. Definition of Done: Before vs After

| Metric / Feature | Before Optimization | After Optimization | Why It Matters for Longevity |
| :--- | :--- | :--- | :--- |
| **Public Route Generation** | Dynamic (`ƒ`) on-demand fetches | **100% Static & SSG (`○` and `●`)** | Stays within 100k daily function limit on Vercel Hobby |
| **API Waterfall** | Client-side `fetch("/api/changelog")` on mount | **Direct server pre-fetch passed as props** | Zero layout shifts, faster LCP, no extra client requests |
| **Changelog Dates** | Hardcoded `"Today"` / `"Yesterday"` | **Real calendar dates (`Oct 23`)** | Never goes stale in ISR or Edge cache |
| **Banner Asset** | Unsplash hotlink (external dependency) | **Self-hosted `public/banner.webp` (27.7 kB)** | Eliminates external outage risk & DNS lookup |
| **Images in Carousel & Rail** | Raw unoptimized `<img>` tags | **Next.js `<Image fill sizes="..." />`** | Responsive responsive sizing, zero quota waste |
| **Image Remote Patterns** | Wildcard `**` (unrestricted) | **Strict allowlist (`supabase`, `blob`, `github`)** | Prevents SSRF & CDN abuse |
| **WebGL Shader Hero** | Uncapped DPR (renders 8.3M px on 4K) | **Capped at 1.5 DPR + tab visibility pause** | Saves 44% GPU rasterization, 0% CPU when tab hidden |
| **Canvas Script Loading** | Synchronous module import | **`next/dynamic` (`ssr: false`) with CSS fallback** | First Contentful Paint is instant; WebGL never blocks |
| **Command Menu (⌘K)** | Bundled into critical JS | **Lazy-loaded on demand** | Keeps initial public bundle lean |
| **SEO & Open Graph** | Duplicate meta tags on all pages | **`metadataBase`, title template, unique meta per page** | Social cards display rich previews on Twitter/Discord |
| **Sitemap & Robots** | Missing (`404 Not Found`) | **`/sitemap.xml` (cached 24h) & `/robots.txt`** | Search engines index public articles; admin routes excluded |
| **Dead Code & Packages** | 5 unused packages, 5 dead files | **All uninstalled, 0 unused locals/parameters** | Smaller `node_modules`, zero dead code bloat |
| **TypeScript Strictness** | Loose unused symbol checking | **`noUnusedLocals: true`, `noUnusedParameters: true`** | Catches accidental dead code at build time |

---

## 7. 5-Minute Monthly Maintenance Routine

Keep your site running smoothly for years with this quick 5-minute monthly checklist:

1. **Check Vercel Dashboard Usage:**
   - Log into [vercel.com](https://vercel.com).
   - Go to **Usage** under your team/account:
     - **Image Optimization:** Check that you are well below the 1,000 monthly transformations limit.
     - **Fast Origin Transfer:** Ensure bandwidth is within the 100 GB limit.
     - **Edge Middleware:** Ensure invocations are well within the 1,000,000 monthly limit (middleware only runs on `/admin`, `/login`, `/api/`).
2. **Check Supabase Storage & Database:**
   - Log into [supabase.com](https://supabase.com).
   - Check that database size is well under the 500 MB free quota.
   - If free projects pause after 1 week of inactivity, making an admin edit or visiting the site wakes it up.
3. **Run Local Maintenance:**
   ```powershell
   # Check for security vulnerabilities in dependencies
   npm audit --omit=dev

   # Check for any new unused exports or files
   npm run knip

   # Verify clean build
   npm run build
   ```
4. **Push Updates to Main:**
   ```powershell
   git push origin main
   ```
   Vercel automatically builds and deploys your changes to production.
