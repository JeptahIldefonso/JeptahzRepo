import React from "react";
import { BookOpen } from "lucide-react";
import { getEntries } from "@/db/data-provider";
import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DocsTheoryPage() {
  const entries = await getEntries({ topicSlug: "docs" });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center space-x-2 text-fg-subtle mb-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
            Browse // Notes & Docs
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-fg">
              Notes & Docs
            </h1>
            <p className="mt-1 text-sm text-fg-muted max-w-xl">
              Technical breakdowns, architecture notes, and guides with high-definition diagrams and code.
            </p>
          </div>
          <div className="font-mono text-xs text-fg-subtle border border-border bg-bg-raised px-3 py-1.5 rounded-[2px] self-start sm:self-auto">
            {entries.length} POSTS
          </div>
        </div>
      </div>

      {/* Grid of Docs */}
      {entries.length === 0 ? (
        <EmptyState
          title="No Documents Found"
          description="There are currently no published documentation or theory notes."
          icon={<BookOpen className="w-8 h-8 stroke-[1.25] text-fg-subtle" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} basePath={`/home/docs/${entry.slug}`} />
          ))}
        </div>
      )}
    </div>
  );
}
