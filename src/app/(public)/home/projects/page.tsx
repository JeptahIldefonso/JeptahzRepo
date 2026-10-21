import React from "react";
import { Code2 } from "lucide-react";
import { getEntries } from "@/db/data-provider";
import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ProjectsPage() {
  const entries = await getEntries({ topicSlug: "projects" });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center space-x-2 text-fg-subtle mb-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
            Academic Repository // Source Code & Labs
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-fg">
              Code Repositories
            </h1>
            <p className="mt-1 text-sm text-fg-muted max-w-xl">
              Source code archives, course assignments, lab implementations, and architectural
              prototypes with GitHub repository links.
            </p>
          </div>
          <div className="font-mono text-xs text-fg-subtle border border-border bg-bg-raised px-3 py-1.5 rounded-[2px] self-start sm:self-auto">
            {entries.length} REPOSITORIES
          </div>
        </div>
      </div>

      {/* Grid of Projects */}
      {entries.length === 0 ? (
        <EmptyState
          title="No Repositories Found"
          description="There are currently no code repositories indexed in this category."
          icon={<Code2 className="w-8 h-8 stroke-[1.25] text-fg-subtle" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} basePath={`/home/projects/${entry.slug}`} />
          ))}
        </div>
      )}
    </div>
  );
}
