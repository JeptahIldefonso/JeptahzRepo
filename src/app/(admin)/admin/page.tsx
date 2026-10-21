import React from "react";
import { getApps, getEntries } from "@/db/data-provider";
import { AdminManager } from "./admin-manager";

export default async function AdminPage() {
  const [apps, entries] = await Promise.all([getApps(), getEntries()]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="font-display text-2xl font-medium tracking-tight text-fg">
          Control Center & Management Studio
        </h1>
        <p className="text-xs text-fg-muted">
          Add, modify, and delete repository entries, application showcases, and system configurations.
        </p>
      </div>

      <AdminManager initialApps={apps} initialEntries={entries} />
    </div>
  );
}
