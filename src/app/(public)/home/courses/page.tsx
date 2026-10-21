import React from "react";
import { GraduationCap } from "lucide-react";
import { getEntries } from "@/db/data-provider";
import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function CoursesPage() {
  const entries = await getEntries({ topicSlug: "courses" });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center space-x-2 text-fg-subtle mb-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
            Academic Repository // Curricula & Syllabi
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-fg">
              Courses & Curriculum
            </h1>
            <p className="mt-1 text-sm text-fg-muted max-w-xl">
              Curated university computer science course modules, syllabi, recommended textbooks,
              and lecture roadmap notes.
            </p>
          </div>
          <div className="font-mono text-xs text-fg-subtle border border-border bg-bg-raised px-3 py-1.5 rounded-[2px] self-start sm:self-auto">
            {entries.length} CURRICULA
          </div>
        </div>
      </div>

      {/* Grid of Courses */}
      {entries.length === 0 ? (
        <EmptyState
          title="No Courses Listed"
          description="There are currently no course syllabi or curricula in the repository."
          icon={<GraduationCap className="w-8 h-8 stroke-[1.25] text-fg-subtle" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} basePath={`/home/courses/${entry.slug}`} />
          ))}
        </div>
      )}
    </div>
  );
}
