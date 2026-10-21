-- 001_initial_schema.sql
-- JeptahzRepo: Initial PostgreSQL Schema with Strict RLS and Future-Proofing

create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'guest' check (role in ('admin', 'guest')),
  discord_id text,
  avatar_url text,
  bio text,
  social_links jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 2. Topics Taxonomy Table
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  sort_order int default 0,
  is_visible boolean default true,
  created_at timestamptz default now()
);

-- 3. Entries Table (Unified Repository)
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  type text not null check (type in ('text', 'file', 'link', 'course', 'image', 'idea', 'doc')),
  topic_slug text references public.topics(slug) on delete set null,
  summary text,
  content text,
  file_url text,
  file_name text,
  file_size bigint,
  external_url text,
  cover_image_url text,
  gallery_images jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,
  tags text[] default '{}'::text[],
  access_level text default 'public' check (access_level in ('public', 'community', 'premium', 'admin')),
  price_usd numeric(10, 2) default 0.00,
  is_private boolean default false,
  is_pinned boolean default false,
  is_published boolean default true,
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Apps Showcase Table
create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  tagline text not null,
  description text,
  version text default 'v1.0.0',
  badge text default 'Active',
  category text default 'Desktop App',
  carousel_images jsonb default '[]'::jsonb,
  repo_url text,
  gdrive_url text,
  demo_url text,
  install_instructions text,
  tech_stack text[] default '{}'::text[],
  is_paid boolean default false,
  price_usd numeric(10, 2) default 0.00,
  sort_order int default 0,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Site Settings Table
create table if not exists public.site_settings (
  id text primary key default 'global',
  site_title text default 'JeptahzRepo',
  site_tagline text default 'Computer Science & Engineering Knowledge Archive',
  intro_heading text default 'Curated Computer Science Repository & Intellectual Vault',
  intro_subtext text default 'An open archive of software applications, theory notes, lecture syllabi, and engineering ideas.',
  about_markdown text,
  contact_email text,
  social_links jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Row Level Security (RLS) Setup
alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.entries enable row level security;
alter table public.apps enable row level security;
alter table public.site_settings enable row level security;

-- Public Read Policies
create policy "Public can read visible topics" on public.topics for select using (is_visible = true);
create policy "Public can read published entries" on public.entries for select using (is_published = true and is_private = false);
create policy "Public can read apps" on public.apps for select using (true);
create policy "Public can read settings" on public.site_settings for select using (true);
create policy "Public can read admin profile" on public.profiles for select using (role = 'admin');

-- Admin Mutation Policies
create policy "Admin can do everything on profiles" on public.profiles for all using (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admin can do everything on topics" on public.topics for all using (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admin can do everything on entries" on public.entries for all using (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admin can do everything on apps" on public.apps for all using (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admin can do everything on settings" on public.site_settings for all using (auth.uid() in (select id from public.profiles where role = 'admin'));
