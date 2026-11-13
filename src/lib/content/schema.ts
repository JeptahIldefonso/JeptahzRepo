import { z } from "zod";

// 1. Apps public schema
export const appPublicSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  version: z.string().nullable().optional(),
  badge: z.string().nullable().optional(),
  category: z.string().default("Desktop App"),
  carousel_images: z
    .array(
      z.object({
        url: z.string(),
        caption: z.string().optional(),
      })
    )
    .default([]),
  repo_url: z.string().nullable().optional(),
  gdrive_url: z.string().nullable().optional(),
  demo_url: z.string().nullable().optional(),
  install_instructions: z.string().nullable().optional(),
  tech_stack: z.array(z.string()).default([]),
  sort_order: z.number().default(0),
  is_featured: z.boolean().default(false),
  created_at: z.string().optional(),
});

// 2. Entries (docs, courses, ideas, resources) public schema
export const entryMediaItemSchema = z.object({
  id: z.string(),
  type: z.enum(["image", "video"]),
  url: z.string(),
  caption: z.string().optional(),
  file_size: z.number().optional(),
});

export const entryAttachedFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.string().optional(),
  type: z.string().default("file"),
  url: z.string(),
});

export const entryPublicSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  type: z.enum(["text", "file", "link", "course", "image", "idea", "doc"]),
  topic_slug: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  file_url: z.string().nullable().optional(),
  file_name: z.string().nullable().optional(),
  file_size: z.number().nullable().optional(),
  external_url: z.string().nullable().optional(),
  cover_image_url: z.string().nullable().optional(),
  gallery_images: z.array(z.string()).optional(),
  media_items: z.array(entryMediaItemSchema).optional(),
  attached_files: z.array(entryAttachedFileSchema).optional(),
  video_url: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).default([]),
  access_level: z.string().optional(),
  price_usd: z.number().optional(),
  is_private: z.boolean().optional(),
  is_pinned: z.boolean().optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().optional(),
  view_count: z.number().optional(),
  likes_count: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// 3. Topics public schema
export const topicPublicSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  sort_order: z.number().default(0),
  is_visible: z.boolean().default(true),
});

// 4. Site Settings public schema
export const siteSettingsPublicSchema = z.object({
  site_title: z.string().default("JeptahzRepo"),
  site_tagline: z.string().nullable().optional(),
  intro_heading: z.string().nullable().optional(),
  intro_subtext: z.string().nullable().optional(),
  about_markdown: z.string().nullable().optional(),
  contact_email: z.string().nullable().optional(),
  social_links: z.record(z.string(), z.string()).default({}),
  changelog_banner_image_url: z.string().nullable().optional(),
  changelog_banner_title: z.string().nullable().optional(),
  changelog_banner_subtitle: z.string().nullable().optional(),
  changelog_banner_link_url: z.string().nullable().optional(),
  changelog_banner_cta_text: z.string().nullable().optional(),
  changelog_banner_is_active: z.boolean().default(true).optional(),
});

// 5. Changelog items public schema
export const changelogItemPublicSchema = z.object({
  id: z.string(),
  version_tag: z.string().nullable().optional(),
  category: z.enum(["feature", "release", "fix", "doc", "system"]),
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  href: z.string().nullable().optional(),
  sort_order: z.number().default(0),
  created_at: z.string().optional(),
});

// 6. Complete Canonical Site Content Snapshot Contract
export const siteContentSchema = z.object({
  version: z.number().default(0),
  generatedAt: z.string(),
  apps: z.array(appPublicSchema).default([]),
  entries: z.array(entryPublicSchema).default([]),
  topics: z.array(topicPublicSchema).default([]),
  site_settings: siteSettingsPublicSchema.default({
    site_title: "JeptahzRepo",
    social_links: {},
    changelog_banner_is_active: true,
  }),
  changelog_items: z.array(changelogItemPublicSchema).default([]),
});

export type SiteContent = z.infer<typeof siteContentSchema>;

export const emptyContent: SiteContent = {
  version: 0,
  generatedAt: "1970-01-01T00:00:00.000Z",
  apps: [],
  entries: [],
  topics: [],
  site_settings: {
    site_title: "JeptahzRepo",
    social_links: {},
    changelog_banner_is_active: true,
  },
  changelog_items: [],
};
