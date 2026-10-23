import { pgTable, text, timestamp, boolean, uuid, integer, bigint, numeric, jsonb } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: text("role").default("guest").notNull(),
  discordId: text("discord_id"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  socialLinks: jsonb("social_links").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const entries = pgTable("entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  type: text("type").notNull(), // 'text' | 'file' | 'link' | 'course' | 'image' | 'idea' | 'doc'
  topicSlug: text("topic_slug").references(() => topics.slug),
  summary: text("summary"),
  content: text("content"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: bigint("file_size", { mode: "number" }),
  externalUrl: text("external_url"),
  coverImageUrl: text("cover_image_url"),
  galleryImages: jsonb("gallery_images").default([]),
  metadata: jsonb("metadata").default({}),
  tags: text("tags").array().default([]),
  accessLevel: text("access_level").default("public").notNull(), // 'public' | 'community' | 'premium' | 'admin'
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).default("0.00"),
  isPrivate: boolean("is_private").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const apps = pgTable("apps", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  tagline: text("tagline").notNull(),
  description: text("description"),
  version: text("version").default("v1.0.0").notNull(),
  badge: text("badge").default("Active").notNull(),
  category: text("category").default("Desktop App").notNull(),
  carouselImages: jsonb("carousel_images").default([]),
  repoUrl: text("repo_url"),
  gdriveUrl: text("gdrive_url"),
  demoUrl: text("demo_url"),
  installInstructions: text("install_instructions"),
  techStack: text("tech_stack").array().default([]),
  isPaid: boolean("is_paid").default(false).notNull(),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).default("0.00"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("global"),
  siteTitle: text("site_title").default("JeptahzRepo").notNull(),
  siteTagline: text("site_tagline"),
  introHeading: text("intro_heading"),
  introSubtext: text("intro_subtext"),
  aboutMarkdown: text("about_markdown"),
  contactEmail: text("contact_email"),
  socialLinks: jsonb("social_links").default({}),
  changelogBannerImageUrl: text("changelog_banner_image_url"),
  changelogBannerTitle: text("changelog_banner_title"),
  changelogBannerSubtitle: text("changelog_banner_subtitle"),
  changelogBannerLinkUrl: text("changelog_banner_link_url"),
  changelogBannerCtaText: text("changelog_banner_cta_text"),
  changelogBannerIsActive: boolean("changelog_banner_is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type AppItem = typeof apps.$inferSelect;
export type NewAppItem = typeof apps.$inferInsert;
export type Topic = typeof topics.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
