import React from "react";
import {
  getApps,
  getEntries,
  getChangelogItems,
  getChangelogBanner,
} from "@/db/data-provider";
import { AdminStudioShell } from "@/components/admin/admin-studio-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Studio - JeptahzRepo",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const [apps, entries, changelog, banner] = await Promise.all([
    getApps(),
    getEntries({ includeUnpublished: true }),
    getChangelogItems(),
    getChangelogBanner(),
  ]);

  return (
    <AdminStudioShell
      initialApps={apps}
      initialEntries={entries}
      initialChangelog={changelog}
      initialBanner={banner}
    />
  );
}
