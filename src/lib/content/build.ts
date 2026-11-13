import "server-only";
import {
  getApps,
  getEntries,
  getTopics,
  getSiteSettings,
  getChangelogItems,
} from "@/db/data-provider";
import { siteContentSchema, type SiteContent } from "./schema";

/**
 * Single Canonical Builder (Blueprint Section 8.2)
 * Assembles and validates database rows into a strictly typed SiteContent contract.
 * Private admin notes and internal system flags are stripped.
 */
export async function buildContentFromDb(): Promise<SiteContent> {
  const [apps, rawEntries, topics, siteSettings, changelogItems] = await Promise.all([
    getApps(),
    getEntries({ includeUnpublished: false }), // Drafts NEVER leak to public
    getTopics(),
    getSiteSettings(),
    getChangelogItems(),
  ]);

  // Ensure entries only contain public items
  const publicEntries = rawEntries.filter((e) => e.is_published !== false);

  const content: SiteContent = {
    version: Date.now(),
    generatedAt: new Date().toISOString(),
    apps: apps.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    entries: publicEntries,
    topics: topics.filter((t) => t.is_visible !== false),
    site_settings: siteSettings,
    changelog_items: changelogItems.sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    ),
  };

  // Validates against Zod contract; throws if shape drifts
  return siteContentSchema.parse(content);
}
