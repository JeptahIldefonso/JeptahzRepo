import type { MetadataRoute } from "next";
import { getApps, getEntries } from "@/db/data-provider";

export const revalidate = 86400; // Cache sitemap for 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://jeptahz-repo.vercel.app";

  const [apps, entries] = await Promise.all([getApps(), getEntries()]);

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/home",
    "/home/apps",
    "/home/docs",
    "/home/courses",
    "/home/ideas",
    "/home/resources",
    "/home/about",
    "/home/contact",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" || route === "/home" ? 1.0 : 0.8,
  }));

  // App showcases
  const appRoutes: MetadataRoute.Sitemap = apps.map((app) => ({
    url: `${siteUrl}/home/apps/${app.slug}`,
    lastModified: new Date(app.created_at || Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic documentation & courses
  const entryRoutes: MetadataRoute.Sitemap = entries.map((entry) => {
    const parentPath =
      entry.type === "course" || entry.topic_slug === "courses"
        ? "/home/courses"
        : entry.topic_slug === "projects"
        ? "/home/projects"
        : "/home/docs";

    return {
      url: `${siteUrl}${parentPath}/${entry.slug}`,
      lastModified: new Date(entry.created_at || Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  return [...staticRoutes, ...appRoutes, ...entryRoutes];
}
