# Production Deployment Guide: Vercel & Custom Domain

This document outlines the complete process for deploying **JeptahzRepo** to production on [Vercel](https://vercel.com) with custom domain and SSL configuration.

---

## 1. Quick Verification

Before triggering a deployment, verify that the project builds locally without errors:

```bash
# Type check
npx tsc --noEmit

# Production build test
npm run build
```

---

## 2. Environment Variables Configuration

In your **Vercel Project Dashboard** (**Settings > Environment Variables**), configure the following for the **Production** environment:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL with https (e.g., `https://jeptahzrepo.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (Admin operations) |
| `DATABASE_URL` | PostgreSQL connection string (Transaction pooler) |

*Note: If Supabase variables are omitted, the application automatically runs in resilient offline fallback mode using the built-in mock seed.*

---

## 3. Deploying to Vercel

### Method A: Vercel CLI (Fastest)

1. **Log in to Vercel:**
   ```bash
   vercel login
   ```

2. **Link and preview deploy:**
   ```bash
   vercel
   ```

3. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Method B: Git Integration (Continuous Deployment)

1. Push your code to GitHub:
   ```bash
   git push origin main
   ```
2. Navigate to [vercel.com/new](https://vercel.com/new).
3. Import the `JeptahIldefonso/JeptahzRepo` repository.
4. Set the Framework Preset to **Next.js**.
5. Add your Environment Variables.
6. Click **Deploy**. Any future commits pushed to `main` will automatically build and deploy.

---

## 4. Custom Domain & DNS Records

1. Go to **Project Settings > Domains** in your Vercel dashboard.
2. Enter your custom domain (e.g., `jeptahzrepo.com` and `www.jeptahzrepo.com`).
3. Add the following DNS records with your domain registrar:

### Apex Domain (`@`)
- **Type:** `A`
- **Name:** `@` (or leave blank)
- **Value:** `76.76.21.21`
- **TTL:** Automatic / 300

### Subdomain (`www`)
- **Type:** `CNAME`
- **Name:** `www`
- **Value:** `cname.vercel-dns.com.`
- **TTL:** Automatic / 300

---

## 5. Security & Caching

The repository includes `vercel.json` which automatically enforces:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- Secure permission policies
