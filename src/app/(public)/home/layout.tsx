import React from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import {
  getApps,
  getEntries,
  getChangelogItems,
  getChangelogBanner,
} from "@/db/data-provider";
import { HubLayoutClient } from "./hub-layout-client";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [apps, entries, changelog, banner] = await Promise.all([
    getApps(),
    getEntries(),
    getChangelogItems(),
    getChangelogBanner(),
  ]);

  const searchItems = [
    ...apps.map((a) => ({
      id: a.id,
      title: a.title,
      type: "app",
      slug: a.slug,
      href: `/home/apps/${a.slug}`,
    })),
    ...entries.map((e) => ({
      id: e.id,
      title: e.title,
      type: e.type,
      slug: e.slug,
      href: `/home/${e.topic_slug || "docs"}/${e.slug}`,
    })),
  ];

  return (
    <HubLayoutClient
      searchItems={searchItems}
      initialChangelog={changelog}
      initialBanner={banner}
    >
      {children}
    </HubLayoutClient>
  );
}
