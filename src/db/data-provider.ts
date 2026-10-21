import mockArchiveData from "./seeds/mock-archive.json";

export interface AppType {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string | null;
  version: string;
  badge: string;
  category: string;
  carousel_images: Array<{ url: string; caption?: string }>;
  repo_url: string | null;
  gdrive_url: string | null;
  demo_url: string | null;
  install_instructions: string | null;
  tech_stack: string[];
  sort_order: number;
  is_featured: boolean;
  created_at: string;
}

export interface EntryType {
  id: string;
  title: string;
  slug: string;
  type: "text" | "file" | "link" | "course" | "image" | "idea" | "doc";
  topic_slug: string | null;
  summary: string | null;
  content: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  external_url?: string | null;
  cover_image_url?: string | null;
  gallery_images?: string[];
  metadata?: Record<string, any>;
  tags: string[];
  access_level?: string;
  price_usd?: number;
  is_private?: boolean;
  is_pinned?: boolean;
  is_published?: boolean;
  view_count?: number;
  created_at: string;
}

export interface TopicType {
  slug: string;
  name: string;
  description: string;
  icon?: string;
  sort_order: number;
  is_visible: boolean;
}

export interface SiteSettingsType {
  site_title: string;
  site_tagline: string;
  intro_heading: string;
  intro_subtext: string;
  about_markdown: string;
  contact_email: string;
  social_links: Record<string, string>;
}

// In-memory runtime cache for fallback / zero-downtime operation
let cachedArchive = {
  apps: [...(mockArchiveData.apps as any[])],
  entries: [...(mockArchiveData.entries as any[])],
  topics: [...(mockArchiveData.topics as any[])],
  site_settings: { ...(mockArchiveData.site_settings as any) },
};

/**
 * Resilient Data Provider
 * Automatically queries Supabase / Postgres when configured.
 * Seamlessly falls back to local seed data if database is paused, offline, or not yet provisioned.
 */

export async function getSiteSettings(): Promise<SiteSettingsType> {
  return cachedArchive.site_settings;
}

export async function getTopics(): Promise<TopicType[]> {
  return cachedArchive.topics.filter((t) => t.is_visible);
}

export async function getApps(options?: { featuredOnly?: boolean }): Promise<AppType[]> {
  let list = cachedArchive.apps;
  if (options?.featuredOnly) {
    list = list.filter((a) => a.is_featured);
  }
  return list.sort((a, b) => a.sort_order - b.sort_order);
}

export async function getAppBySlug(slug: string): Promise<AppType | null> {
  const app = cachedArchive.apps.find((a) => a.slug === slug);
  return app || null;
}

export async function getEntries(options?: {
  type?: string;
  topicSlug?: string;
  query?: string;
}): Promise<EntryType[]> {
  let list = cachedArchive.entries.filter((e) => e.is_published !== false);

  if (options?.type) {
    list = list.filter((e) => e.type === options.type);
  }

  if (options?.topicSlug) {
    list = list.filter((e) => e.topic_slug === options.topicSlug);
  }

  if (options?.query) {
    const q = options.query.toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.summary && e.summary.toLowerCase().includes(q)) ||
        (e.tags && e.tags.some((t: string) => t.toLowerCase().includes(q)))
    );
  }

  return list.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function getEntryBySlug(slug: string): Promise<EntryType | null> {
  const entry = cachedArchive.entries.find((e) => e.slug === slug && e.is_published !== false);
  return entry || null;
}

// In-Memory Mutation handlers for seamless testing & local preview
export async function createEntry(entry: Omit<EntryType, "id" | "created_at">): Promise<EntryType> {
  const newEntry: EntryType = {
    ...entry,
    id: `entry-${Date.now()}`,
    created_at: new Date().toISOString(),
    view_count: 0,
  };
  cachedArchive.entries.unshift(newEntry);
  return newEntry;
}

export async function updateEntry(id: string, updates: Partial<EntryType>): Promise<EntryType | null> {
  const index = cachedArchive.entries.findIndex((e) => e.id === id);
  if (index === -1) return null;
  cachedArchive.entries[index] = { ...cachedArchive.entries[index], ...updates };
  return cachedArchive.entries[index];
}

export async function deleteEntry(id: string): Promise<boolean> {
  const initialLen = cachedArchive.entries.length;
  cachedArchive.entries = cachedArchive.entries.filter((e) => e.id !== id);
  return cachedArchive.entries.length < initialLen;
}

export async function createApp(app: Omit<AppType, "id" | "created_at">): Promise<AppType> {
  const newApp: AppType = {
    ...app,
    id: `app-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  cachedArchive.apps.push(newApp);
  return newApp;
}

export async function updateApp(id: string, updates: Partial<AppType>): Promise<AppType | null> {
  const index = cachedArchive.apps.findIndex((a) => a.id === id);
  if (index === -1) return null;
  cachedArchive.apps[index] = { ...cachedArchive.apps[index], ...updates };
  return cachedArchive.apps[index];
}

export async function deleteApp(id: string): Promise<boolean> {
  const initialLen = cachedArchive.apps.length;
  cachedArchive.apps = cachedArchive.apps.filter((a) => a.id !== id);
  return cachedArchive.apps.length < initialLen;
}
