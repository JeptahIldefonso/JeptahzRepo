import React from "react";
import { Box, Plus } from "lucide-react";
import { getApps } from "@/db/data-provider";
import { AppCard } from "@/components/apps/app-card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AppsShowcasePage() {
  const apps = await getApps();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center space-x-2 text-fg-subtle mb-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
            Command Center // Software Lab
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-fg">
              Application Showcase
            </h1>
            <p className="mt-1 text-sm text-fg-muted max-w-xl">
              Production desktop software, analytical utilities, and command-line tools.
              Explore interactive screenshot carousels and install verified binaries.
            </p>
          </div>
          <div className="font-mono text-xs text-fg-subtle border border-border bg-bg-raised px-3 py-1.5 rounded-[2px] self-start sm:self-auto">
            SHOWCASE: {apps.length} BUILDS
          </div>
        </div>
      </div>

      {/* Grid of Applications */}
      {apps.length === 0 ? (
        <EmptyState
          title="No Software Uploaded"
          description="The application showcase currently has no published builds."
          icon={<Box className="w-8 h-8 stroke-[1.25] text-fg-subtle" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
