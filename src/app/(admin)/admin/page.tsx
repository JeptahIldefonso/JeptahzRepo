import React from "react";
import { getApps, getEntries, getChangelogItems } from "@/db/data-provider";
import { AdminManager } from "./admin-manager";

export default async function AdminPage() {
  const [apps, entries, changelog] = await Promise.all([
    getApps(),
    getEntries({ includeUnpublished: true }),
    getChangelogItems(),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-fg">
          Content Manager
        </h1>
        <p className="text-xs sm:text-sm text-fg-muted mt-1">
          Create, edit, and manage your notes, projects, ideas, links, courses, and system changelog.
        </p>
      </div>

      <AdminManager
        initialApps={apps}
        initialEntries={entries}
        initialChangelog={changelog}
      />
    </div>
  );
}
