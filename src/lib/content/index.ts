import "server-only";
import { unstable_cache } from "next/cache";
import fs from "fs";
import path from "path";
import { buildContentFromDb } from "./build";
import { siteContentSchema, emptyContent, type SiteContent } from "./schema";

export const CONTENT_TAG = "content";

/**
 * Live Mode: Direct read from primary database (cached with revalidateTag)
 */
const getLive = unstable_cache(buildContentFromDb, ["site-content-live"], {
  tags: [CONTENT_TAG],
});

/**
 * Reads local snapshot from filesystem.
 */
function readLocalSnapshot(): SiteContent {
  try {
    const customPath = process.env.SNAPSHOT_PATH;
    const targetPath = customPath
      ? path.isAbsolute(customPath)
        ? customPath
        : path.join(process.cwd(), customPath)
      : path.join(process.cwd(), "src", "db", "seeds", "mock-archive.json");

    if (fs.existsSync(targetPath)) {
      const raw = fs.readFileSync(targetPath, "utf-8");
      const parsed = JSON.parse(raw);
      return siteContentSchema.parse({
        version: parsed.version ?? 1,
        generatedAt: parsed.generatedAt ?? new Date().toISOString(),
        apps: parsed.apps ?? [],
        entries: parsed.entries ?? [],
        topics: parsed.topics ?? [],
        site_settings: parsed.site_settings ?? {},
        changelog_items: parsed.changelog_items ?? [],
      });
    }
  } catch (err) {
    console.warn("[content] Failed to read static snapshot:", err);
  }
  return emptyContent;
}

/**
 * Universal Content Reader (Blueprint Section 8.3)
 * Dynamic mode switch based on CONTENT_MODE environment variable:
 * - static (default): Reads snapshot from disk (committed to repo)
 * - staged: Cached snapshot from ready deployment state
 * - live: Cached direct database queries
 */
export async function getContent(): Promise<SiteContent> {
  const mode = (process.env.CONTENT_MODE || "static").toLowerCase();

  switch (mode) {
    case "live":
      return getLive();
    case "staged":
      return getLive();
    case "static":
    default:
      return readLocalSnapshot();
  }
}

// Convenience selectors for public pages
export const getPublicApps = async () => (await getContent()).apps;
export const getPublicApp = async (slug: string) =>
  (await getPublicApps()).find((a) => a.slug === slug) ?? null;

export const getPublicEntries = async () => (await getContent()).entries;
export const getPublicEntry = async (slug: string) =>
  (await getPublicEntries()).find((e) => e.slug === slug) ?? null;

export const getPublicTopics = async () => (await getContent()).topics;
export const getPublicSiteSettings = async () => (await getContent()).site_settings;
export const getPublicChangelog = async () => (await getContent()).changelog_items;
