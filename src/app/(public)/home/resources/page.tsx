import React from "react";
import { Link2, ExternalLink } from "lucide-react";
import { getEntries } from "@/db/data-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function ResourcesPage() {
  const entries = await getEntries({ topicSlug: "resources" });

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
      {entries.length === 0 ? (
        <EmptyState
          title="No Resources Found"
          description="There are currently no external resources or bookmarks listed."
          icon={<Link2 className="w-8 h-8 stroke-[1.25] text-fg-subtle" />}
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-border bg-bg-raised p-5 rounded-[2px] hover:border-fg/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <Badge variant="subtle">LINK</Badge>
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
                  className="shrink-0 inline-flex items-center space-x-1.5 font-mono text-xs bg-bg border border-border px-3 py-2 rounded-[2px] hover:border-fg/40 hover:text-fg text-fg-subtle transition-colors"
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
