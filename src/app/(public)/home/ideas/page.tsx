import React from "react";
import { Lightbulb } from "lucide-react";
import { getEntries } from "@/db/data-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function IdeasPage() {
  const entries = await getEntries({ topicSlug: "ideas" });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center space-x-2 text-fg-subtle mb-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
            Intellectual Vault // Raw Ideas & Devlogs
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-fg">
              Raw Ideas & Devlogs
            </h1>
            <p className="mt-1 text-sm text-fg-muted max-w-xl">
              Unfiltered thoughts, thesis concepts, hackathon blueprints, and conceptual architecture
              diagrams captured in real time.
            </p>
          </div>
          <div className="font-mono text-xs text-fg-subtle border border-border bg-bg-raised px-3 py-1.5 rounded-[2px] self-start sm:self-auto">
            {entries.length} LOGS
          </div>
        </div>
      </div>

      {/* List of Ideas */}
      {entries.length === 0 ? (
        <EmptyState
          title="No Ideas Logged"
          description="There are currently no raw brainstorm entries in the idea vault."
          icon={<Lightbulb className="w-8 h-8 stroke-[1.25] text-fg-subtle" />}
        />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-border bg-bg-raised p-6 rounded-[2px] hover:border-fg/40 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="default">IDEA</Badge>
                  {entry.metadata?.status && (
                    <Badge variant="subtle">{entry.metadata.status}</Badge>
                  )}
                </div>
                <span className="font-mono text-[10px] text-fg-subtle">
                  {formatDate(entry.created_at)}
                </span>
              </div>

              <h3 className="font-display text-xl font-medium text-fg">
                {entry.title}
              </h3>

              {entry.summary && (
                <p className="text-sm text-fg-muted leading-relaxed">
                  {entry.summary}
                </p>
              )}

              {entry.content && (
                <div className="mt-3 border-t border-border/50 pt-3 text-xs text-fg-subtle font-mono leading-relaxed bg-bg p-3 rounded-[2px] whitespace-pre-line">
                  {entry.content}
                </div>
              )}

              {entry.tags && (
                <div className="flex gap-1.5 pt-1">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[9px] text-fg-subtle bg-bg border border-border px-1.5 py-0.5 rounded-[2px]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
