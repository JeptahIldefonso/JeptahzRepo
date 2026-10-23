"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, Link2, ExternalLink, Pin, Globe } from "lucide-react";
import { EntryType } from "@/db/data-provider";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ResourcesFeedProps {
  initialEntries: EntryType[];
}

export function ResourcesFeed({ initialEntries }: ResourcesFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: '/' to focus search input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    initialEntries.forEach((entry) => {
      entry.tags?.forEach((tag) => set.add(tag));
    });
    return Array.from(set);
  }, [initialEntries]);

  // Filter entries in real-time
  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return initialEntries.filter((entry) => {
      // Tag filter
      if (selectedTag !== "all") {
        const hasTag = entry.tags?.some(
          (t) => t.toLowerCase() === selectedTag.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // Search query filter
      if (!q) return true;

      const titleMatch = entry.title?.toLowerCase().includes(q);
      const summaryMatch = entry.summary?.toLowerCase().includes(q);
      const contentMatch = entry.content?.toLowerCase().includes(q);
      const urlMatch = entry.external_url?.toLowerCase().includes(q);
      const tagsMatch = entry.tags?.some((t) => t.toLowerCase().includes(q));

      return titleMatch || summaryMatch || contentMatch || urlMatch || tagsMatch;
    });
  }, [initialEntries, searchQuery, selectedTag]);

  // Sort: Pinned first, then newest
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredEntries]);

  // Extract clean hostname for link preview
  const getHostname = (url?: string | null) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return url.replace(/^https?:\/\//, "").split("/")[0];
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Modern Minimalist Toolbar: Search on Left, Tags on Right ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        {/* Compact Minimal Search Input */}
        <div className="relative w-full sm:w-64 md:w-72 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-fg-subtle">
            <Search className="w-3.5 h-3.5 stroke-[2]" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search links..."
            className="w-full pl-8 pr-9 py-1 h-8 bg-bg-raised border border-border focus:border-[#041a24] rounded-[4px] text-xs font-mono text-fg placeholder:text-fg-subtle focus:outline-none transition-all shadow-2xs"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-fg-subtle hover:text-fg transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block font-mono text-[9px] text-fg-subtle bg-bg px-1 py-0.5 rounded border border-border">
                /
              </kbd>
            </div>
          )}
        </div>

        {/* Right Side: Tag Filter Pills and Count */}
        <div className="flex flex-wrap items-center sm:justify-end gap-1.5 text-xs font-mono">
          <button
            onClick={() => setSelectedTag("all")}
            className={`px-2.5 py-1 rounded-[4px] transition-all cursor-pointer ${
              selectedTag === "all"
                ? "bg-fg text-bg-raised font-medium shadow-2xs"
                : "bg-bg-raised border border-border text-fg-muted hover:border-[#041a24] hover:text-fg"
            }`}
          >
            All ({initialEntries.length})
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? "all" : tag)}
              className={`px-2.5 py-1 rounded-[4px] transition-all cursor-pointer ${
                selectedTag === tag
                  ? "bg-fg text-bg-raised font-medium shadow-2xs"
                  : "bg-bg-raised border border-border text-fg-muted hover:border-[#041a24] hover:text-fg"
              }`}
            >
              #{tag}
            </button>
          ))}

          <span className="text-[11px] text-fg-subtle pl-1 font-mono hidden md:inline">
            • {sortedEntries.length} {sortedEntries.length === 1 ? "bookmark" : "bookmarks"}
          </span>
        </div>
      </div>

      {/* ── List of Links with Formal Standard Spaces ── */}
      {sortedEntries.length === 0 ? (
        <div className="border border-dashed border-border bg-bg-raised/50 rounded-[8px] p-12 text-center space-y-3">
          <div className="flex justify-center text-fg-subtle">
            <Link2 className="w-8 h-8 stroke-[1.25]" />
          </div>
          <h3 className="font-display text-lg font-medium text-fg">No links found</h3>
          <p className="text-xs font-mono text-fg-muted max-w-sm mx-auto">
            {searchQuery
              ? `No bookmarks match "${searchQuery}". Try searching another keyword.`
              : "There are currently no external links listed."}
          </p>
          {(searchQuery || selectedTag !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag("all");
              }}
              className="mt-2 px-3 py-1.5 bg-fg text-bg-raised text-xs font-mono rounded-[4px] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Show All Links
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-7">
          {sortedEntries.map((entry) => {
            const hostname = getHostname(entry.external_url);

            return (
              <article
                key={entry.id}
                className={`relative rounded-[10px] p-6 sm:p-7 space-y-4 transition-all duration-200 overflow-hidden ${
                  entry.is_pinned
                    ? "border-2 border-neutral-300 hover:border-[#041a24] bg-gradient-to-br from-neutral-100 via-white to-neutral-200/90 hover:from-neutral-200/90 hover:via-neutral-100 hover:to-neutral-300/90 shadow-sm hover:shadow-md ring-1 ring-black/5"
                    : "border border-border bg-bg-raised hover:border-[#041a24] shadow-2xs hover:shadow-sm"
                }`}
              >
                {/* Specular Top Shine Bar for Pinned Links */}
                {entry.is_pinned && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-neutral-300 via-white to-neutral-300 opacity-90" />
                )}

                {/* Top Row: Badges, Date & Hostname */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    {entry.is_pinned ? (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#041a24] text-white font-mono text-[10px] font-semibold tracking-wider uppercase shadow-xs">
                        <Pin className="w-2.5 h-2.5 fill-white rotate-45" />
                        <span>PINNED LINK</span>
                      </span>
                    ) : (
                      <Badge variant="subtle" className="font-mono text-[10px]">
                        LINK
                      </Badge>
                    )}
                    <span className="font-mono text-[11px] text-fg-subtle">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>

                  {hostname && (
                    <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[3px] bg-bg border border-border text-[11px] font-mono text-fg-subtle">
                      <Globe className="w-3 h-3" />
                      <span>{hostname}</span>
                    </div>
                  )}
                </div>

                {/* Main Headline */}
                <div className="space-y-1.5">
                  <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-fg">
                    {entry.external_url ? (
                      <a
                        href={entry.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-baseline space-x-1.5 group inline-flex"
                      >
                        <span>{entry.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0 ml-1 self-center" />
                      </a>
                    ) : (
                      entry.title
                    )}
                  </h2>

                  {(entry.summary || entry.content) && (
                    <p className="text-sm text-fg-muted leading-relaxed font-sans max-w-3xl">
                      {entry.summary || entry.content}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Tags & Direct Action Button */}
                <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Topic Hashtags */}
                  {entry.tags && entry.tags.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {entry.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() =>
                            setSelectedTag(selectedTag === tag ? "all" : tag)
                          }
                          className={`font-mono text-[10px] px-2 py-0.5 rounded-[3px] transition-colors cursor-pointer ${
                            selectedTag === tag
                              ? "bg-fg text-bg-raised font-medium"
                              : "bg-bg border border-border/80 text-fg-subtle hover:text-fg hover:border-[#041a24]"
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Visit External Portal Button */}
                  {entry.external_url && (
                    <a
                      href={entry.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center space-x-1.5 font-mono text-xs px-3.5 py-1.5 rounded-[4px] font-medium transition-all self-start sm:self-auto cursor-pointer ${
                        entry.is_pinned
                          ? "bg-white border border-neutral-300 text-black shadow-2xs hover:bg-[#041a24] hover:text-white hover:border-[#041a24]"
                          : "bg-bg border border-border hover:border-[#041a24] hover:text-fg text-fg-muted"
                      }`}
                    >
                      <span>Visit Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
