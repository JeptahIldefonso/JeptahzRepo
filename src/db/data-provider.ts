import fs from "fs";
import path from "path";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import mockArchiveData from "./seeds/mock-archive.json";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || url.includes("your-project")) return null;
  return createSupabaseClient(url, key);
}

function persistCachedArchive() {
  try {
    const seedPath = path.join(process.cwd(), "src", "db", "seeds", "mock-archive.json");
    if (fs.existsSync(seedPath)) {
      fs.writeFileSync(seedPath, JSON.stringify(cachedArchive, null, 2), "utf-8");
    }
  } catch (err) {
    // Non-blocking in serverless/read-only environments
  }
}

export interface AppType {
  id: string;
  title: string;
  slug: string;
  tagline?: string | null;
  description: string | null;
  version?: string | null;
  badge?: string | null;
  category: string;
  carousel_images: Array<{ url: string; caption?: string }>;
  repo_url: string | null;
  gdrive_url: string | null;
  demo_url?: string | null;
  install_instructions: string | null;
  tech_stack: string[];
  sort_order: number;
  is_featured: boolean;
  created_at: string;
}

export interface EntryMediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  caption?: string;
  file_size?: number;
}

export interface EntryAttachedFile {
  id: string;
  name: string;
  size?: string;
  type: "pdf" | "word" | "doc" | "archive" | "file";
  url: string;
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
  media_items?: EntryMediaItem[];
  attached_files?: EntryAttachedFile[];
  video_url?: string | null;
  metadata?: Record<string, any>;
  tags: string[];
  access_level?: string;
  price_usd?: number;
  is_private?: boolean;
  is_pinned?: boolean;
  is_published?: boolean;
  view_count?: number;
  likes_count?: number;
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
  changelog_banner_image_url?: string | null;
  changelog_banner_title?: string | null;
  changelog_banner_subtitle?: string | null;
  changelog_banner_link_url?: string | null;
  changelog_banner_cta_text?: string | null;
  changelog_banner_is_active?: boolean;
}

export interface ChangelogBannerType {
  image_url: string;
  title: string;
  subtitle: string;
  link_url: string;
  cta_text: string;
  is_active: boolean;
}

export interface ChangelogItem {
  id: string;
  version_tag?: string;
  category: "feature" | "release" | "fix" | "doc" | "system";
  title: string;
  description: string;
  timestamp: string;
  href?: string;
  sort_order: number;
  created_at: string;
}

// In-memory runtime cache for fallback / zero-downtime operation
let cachedArchive = {
  apps: [...(mockArchiveData.apps as any[])],
  entries: [...(mockArchiveData.entries as any[])],
  topics: [...(mockArchiveData.topics as any[])],
  site_settings: { ...(mockArchiveData.site_settings as any) },
  changelog_items: [...(((mockArchiveData as any).changelog_items || []) as ChangelogItem[])],
};

/**
 * Resilient Data Provider
 * Automatically queries Supabase / Postgres when configured.
 * Seamlessly falls back to local seed data if database is paused, offline, or not yet provisioned.
 */

export async function getSiteSettings(): Promise<SiteSettingsType> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "global")
        .maybeSingle();

      if (!error && data) {
        return {
          site_title: data.site_title || cachedArchive.site_settings.site_title,
          site_tagline: data.site_tagline || cachedArchive.site_settings.site_tagline,
          intro_heading: data.intro_heading || cachedArchive.site_settings.intro_heading,
          intro_subtext: data.intro_subtext || cachedArchive.site_settings.intro_subtext,
          about_markdown: data.about_markdown || cachedArchive.site_settings.about_markdown,
          contact_email: data.contact_email || cachedArchive.site_settings.contact_email,
          social_links: data.social_links || cachedArchive.site_settings.social_links,
          changelog_banner_image_url:
            data.changelog_banner_image_url !== undefined
              ? data.changelog_banner_image_url
              : cachedArchive.site_settings.changelog_banner_image_url,
          changelog_banner_title:
            data.changelog_banner_title !== undefined
              ? data.changelog_banner_title
              : cachedArchive.site_settings.changelog_banner_title,
          changelog_banner_subtitle:
            data.changelog_banner_subtitle !== undefined
              ? data.changelog_banner_subtitle
              : cachedArchive.site_settings.changelog_banner_subtitle,
          changelog_banner_link_url:
            data.changelog_banner_link_url !== undefined
              ? data.changelog_banner_link_url
              : cachedArchive.site_settings.changelog_banner_link_url,
          changelog_banner_cta_text:
            data.changelog_banner_cta_text !== undefined
              ? data.changelog_banner_cta_text
              : cachedArchive.site_settings.changelog_banner_cta_text,
          changelog_banner_is_active:
            data.changelog_banner_is_active !== undefined
              ? data.changelog_banner_is_active
              : cachedArchive.site_settings.changelog_banner_is_active,
        };
      }
    } catch {
      // Fall through to in-memory fallback
    }
  }
  return cachedArchive.site_settings;
}

export async function getChangelogBanner(): Promise<ChangelogBannerType> {
  const settings = await getSiteSettings();
  return {
    image_url:
      settings.changelog_banner_image_url ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    title: settings.changelog_banner_title || "DEV LOGS 2026",
    subtitle:
      settings.changelog_banner_subtitle ||
      "Explore student software builds & open-source tools.",
    link_url: settings.changelog_banner_link_url || "/home/apps",
    cta_text: settings.changelog_banner_cta_text || "Explore Projects",
    is_active: settings.changelog_banner_is_active !== false,
  };
}

export async function updateChangelogBanner(
  updates: Partial<ChangelogBannerType>
): Promise<ChangelogBannerType> {
  const current = await getChangelogBanner();
  const next: ChangelogBannerType = {
    image_url: updates.image_url !== undefined ? updates.image_url : current.image_url,
    title: updates.title !== undefined ? updates.title : current.title,
    subtitle: updates.subtitle !== undefined ? updates.subtitle : current.subtitle,
    link_url: updates.link_url !== undefined ? updates.link_url : current.link_url,
    cta_text: updates.cta_text !== undefined ? updates.cta_text : current.cta_text,
    is_active: updates.is_active !== undefined ? updates.is_active : current.is_active,
  };

  const dbUpdates = {
    changelog_banner_image_url: next.image_url,
    changelog_banner_title: next.title,
    changelog_banner_subtitle: next.subtitle,
    changelog_banner_link_url: next.link_url,
    changelog_banner_cta_text: next.cta_text,
    changelog_banner_is_active: next.is_active,
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase
        .from("site_settings")
        .update(dbUpdates)
        .eq("id", "global");
    } catch {
      // Fallback
    }
  }

  cachedArchive.site_settings = {
    ...cachedArchive.site_settings,
    ...dbUpdates,
  };
  persistCachedArchive();

  return next;
}

export async function getTopics(): Promise<TopicType[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as TopicType[];
      }
    } catch {
      // Fall through to in-memory fallback
    }
  }
  return cachedArchive.topics.filter((t) => t.is_visible);
}

export async function getApps(options?: { featuredOnly?: boolean }): Promise<AppType[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from("apps").select("*").order("sort_order", { ascending: true });
      if (options?.featuredOnly) {
        query = query.eq("is_featured", true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as AppType[];
      }
    } catch {
      // Fall through to in-memory fallback
    }
  }

  let list = cachedArchive.apps;
  if (options?.featuredOnly) {
    list = list.filter((a) => a.is_featured);
  }
  return list.sort((a, b) => a.sort_order - b.sort_order);
}

export async function getAppBySlug(slug: string): Promise<AppType | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        return data as AppType;
      }
    } catch {
      // Fall through to in-memory fallback
    }
  }

  const app = cachedArchive.apps.find((a) => a.slug === slug);
  return app || null;
}

export async function getEntries(options?: {
  type?: string;
  topicSlug?: string;
  query?: string;
  includeUnpublished?: boolean;
}): Promise<EntryType[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let q = supabase
        .from("entries")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (!options?.includeUnpublished) {
        q = q.eq("is_published", true).eq("is_private", false);
      }

      if (options?.type) {
        q = q.eq("type", options.type);
      }
      if (options?.topicSlug) {
        q = q.eq("topic_slug", options.topicSlug);
      }
      if (options?.query) {
        q = q.ilike("title", `%${options.query}%`);
      }

      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        return data as EntryType[];
      }
    } catch {
      // Fall through to in-memory fallback
    }
  }

  let list = options?.includeUnpublished
    ? [...cachedArchive.entries]
    : cachedArchive.entries.filter((e) => e.is_published !== false);

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
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        return data as EntryType;
      }
    } catch {
      // Fall through to in-memory fallback
    }
  }

  const entry = cachedArchive.entries.find((e) => e.slug === slug && e.is_published !== false);
  return entry || null;
}

// Mutation handlers with live Supabase persistence + cache sync
export async function createEntry(entry: Omit<EntryType, "id" | "created_at">): Promise<EntryType> {
  const newEntry: EntryType = {
    ...entry,
    id: `entry-${Date.now()}`,
    created_at: new Date().toISOString(),
    view_count: 0,
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("entries").insert([entry]).select().single();
      if (!error && data) {
        cachedArchive.entries.unshift(data as EntryType);
        persistCachedArchive();
        return data as EntryType;
      }
    } catch {
      // Fallback to local
    }
  }

  cachedArchive.entries.unshift(newEntry);
  persistCachedArchive();
  return newEntry;
}

export async function updateEntry(id: string, updates: Partial<EntryType>): Promise<EntryType | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("entries").update(updates).eq("id", id).select().maybeSingle();
      if (!error && data) {
        const idx = cachedArchive.entries.findIndex((e) => e.id === id);
        if (idx !== -1) cachedArchive.entries[idx] = data as EntryType;
        persistCachedArchive();
        return data as EntryType;
      }
    } catch {
      // Fallback
    }
  }

  const index = cachedArchive.entries.findIndex((e) => e.id === id);
  if (index === -1) return null;
  cachedArchive.entries[index] = { ...cachedArchive.entries[index], ...updates };
  persistCachedArchive();
  return cachedArchive.entries[index];
}

export async function deleteEntry(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("entries").delete().eq("id", id);
    } catch {
      // Fallback
    }
  }

  const initialLen = cachedArchive.entries.length;
  cachedArchive.entries = cachedArchive.entries.filter((e) => e.id !== id);
  persistCachedArchive();
  return cachedArchive.entries.length < initialLen;
}

export async function createApp(app: Omit<AppType, "id" | "created_at">): Promise<AppType> {
  const newApp: AppType = {
    ...app,
    id: `app-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("apps").insert([app]).select().single();
      if (!error && data) {
        cachedArchive.apps.push(data as AppType);
        persistCachedArchive();
        return data as AppType;
      }
    } catch {
      // Fallback
    }
  }

  cachedArchive.apps.push(newApp);
  persistCachedArchive();
  return newApp;
}

export async function updateApp(id: string, updates: Partial<AppType>): Promise<AppType | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("apps").update(updates).eq("id", id).select().maybeSingle();
      if (!error && data) {
        const idx = cachedArchive.apps.findIndex((a) => a.id === id);
        if (idx !== -1) cachedArchive.apps[idx] = data as AppType;
        persistCachedArchive();
        return data as AppType;
      }
    } catch {
      // Fallback
    }
  }

  const index = cachedArchive.apps.findIndex((a) => a.id === id);
  if (index === -1) return null;
  cachedArchive.apps[index] = { ...cachedArchive.apps[index], ...updates };
  persistCachedArchive();
  return cachedArchive.apps[index];
}

export async function deleteApp(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("apps").delete().eq("id", id);
    } catch {
      // Fallback
    }
  }

  const initialLen = cachedArchive.apps.length;
  cachedArchive.apps = cachedArchive.apps.filter((a) => a.id !== id);
  persistCachedArchive();
  return cachedArchive.apps.length < initialLen;
}

export async function getChangelogItems(): Promise<ChangelogItem[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("changelog_items")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as ChangelogItem[];
      }
    } catch {
      // Fall through to in-memory fallback
    }
  }

  return [...cachedArchive.changelog_items].sort((a, b) => {
    if ((a.sort_order ?? 0) !== (b.sort_order ?? 0)) {
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function createChangelogItem(
  item: Omit<ChangelogItem, "id" | "created_at">
): Promise<ChangelogItem> {
  const newItem: ChangelogItem = {
    ...item,
    id: `log-${Date.now()}`,
    sort_order: item.sort_order ?? cachedArchive.changelog_items.length + 1,
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("changelog_items")
        .insert([newItem])
        .select()
        .single();
      if (!error && data) {
        cachedArchive.changelog_items.unshift(data as ChangelogItem);
        persistCachedArchive();
        return data as ChangelogItem;
      }
    } catch {
      // Fallback
    }
  }

  cachedArchive.changelog_items.unshift(newItem);
  persistCachedArchive();
  return newItem;
}

export async function updateChangelogItem(
  id: string,
  updates: Partial<ChangelogItem>
): Promise<ChangelogItem | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("changelog_items")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (!error && data) {
        const idx = cachedArchive.changelog_items.findIndex((c) => c.id === id);
        if (idx !== -1) cachedArchive.changelog_items[idx] = data as ChangelogItem;
        persistCachedArchive();
        return data as ChangelogItem;
      }
    } catch {
      // Fallback
    }
  }

  const index = cachedArchive.changelog_items.findIndex((c) => c.id === id);
  if (index === -1) return null;
  cachedArchive.changelog_items[index] = {
    ...cachedArchive.changelog_items[index],
    ...updates,
  };
  persistCachedArchive();
  return cachedArchive.changelog_items[index];
}

export async function deleteChangelogItem(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("changelog_items").delete().eq("id", id);
    } catch {
      // Fallback
    }
  }

  const initialLen = cachedArchive.changelog_items.length;
  cachedArchive.changelog_items = cachedArchive.changelog_items.filter((c) => c.id !== id);
  persistCachedArchive();
  return cachedArchive.changelog_items.length < initialLen;
}

