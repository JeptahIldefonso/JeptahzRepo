import React from "react";
import { Link2, ExternalLink, Pin } from "lucide-react";
import { getEntries } from "@/db/data-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function ResourcesPage() {
  const entries = await getEntries({ topicSlug: "resources" });

  // Pinned links first, then newest
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center space-x-2 text-fg-subtle mb-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
            Intellectual Vault // Curated Resources & Papers
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-fg">
              Curated Resources & Links
            </h1>
            <p className="mt-1 text-sm text-fg-muted max-w-xl">
              Hand-picked systems whitepapers, official language references, developer tools,
              and academic repositories.
            </p>
          </div>
          <div className="font-mono text-xs text-fg-subtle border border-border bg-bg-raised px-3 py-1.5 rounded-[2px] self-start sm:self-auto">
            {entries.length} BOOKMARKS
          </div>
        </div>
      </div>

      {/* List of Resource Links */}
      {sortedEntries.length === 0 ? (
        <EmptyState
          title="No Resources Found"
          description="There are currently no external resources or bookmarks listed."
          icon={<Link2 className="w-8 h-8 stroke-[1.25] text-fg-subtle" />}
        />
      ) : (
        <div className="space-y-3">
          {sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className={`p-5 rounded-[8px] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                entry.is_pinned
                  ? "border-2 border-neutral-300 hover:border-black bg-gradient-to-br from-neutral-100 via-white to-neutral-200/90 shadow-sm hover:shadow-md ring-1 ring-black/5"
                  : "border border-border bg-bg-raised hover:border-fg/40"
              }`}
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center space-x-2">
                  {entry.is_pinned ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-[4px] bg-neutral-900 text-white font-mono text-[10px] font-semibold tracking-wider uppercase shadow-xs">
                      <Pin className="w-2.5 h-2.5 fill-white rotate-45" />
                      <span>PINNED LINK</span>
                    </span>
                  ) : (
                    <Badge variant="subtle">LINK</Badge>
                  )}
                  <span className="font-mono text-[10px] text-fg-subtle">
                    {formatDate(entry.created_at)}
                  </span>
                </div>
                <h3 className="font-display text-lg font-medium text-fg">
                  {entry.title}
                </h3>
                {entry.summary && (
                  <p className="text-xs text-fg-muted leading-relaxed">
                    {entry.summary}
                  </p>
                )}
                {entry.tags && (
                  <div className="flex gap-1 pt-1">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="font-mono text-[9px] text-fg-subtle">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {entry.external_url && (
                <a
                  href={entry.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className={`shrink-0 inline-flex items-center space-x-1.5 font-mono text-xs px-3 py-2 rounded-[4px] transition-all ${
                    entry.is_pinned
                      ? "bg-white border border-neutral-300 text-black font-semibold shadow-2xs hover:bg-neutral-900 hover:text-white hover:border-neutral-900"
                      : "bg-bg border border-border hover:border-fg/40 hover:text-fg text-fg-subtle"
                  }`}
                >
                  <span>Visit Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
