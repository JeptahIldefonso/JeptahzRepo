import React from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { getApps, getEntries } from "@/db/data-provider";
import { HubLayoutClient } from "./hub-layout-client";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [apps, entries] = await Promise.all([getApps(), getEntries()]);

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
    <HubLayoutClient searchItems={searchItems}>
      {children}
    </HubLayoutClient>
  );
}
