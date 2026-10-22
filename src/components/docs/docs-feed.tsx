"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Hash, Sparkles, Filter } from "lucide-react";
import { EntryType } from "@/db/data-provider";
import { FeedPostCard } from "@/components/docs/feed-post-card";

interface DocsFeedProps {
  initialEntries: EntryType[];
}

export function DocsFeed({ initialEntries }: DocsFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique hashtags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    initialEntries.forEach((entry) => {
      entry.tags?.forEach((tag) => set.add(tag.replace(/^#/, "")));
    });
    return Array.from(set);
  }, [initialEntries]);

  // Sequential Sorting: Pinned posts first, then latest dates first (descending)
  const sortedAndFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = initialEntries.filter((entry) => {
      // Hashtag filter
      if (selectedTag) {
        const hasTag = entry.tags?.some(
          (t) => t.replace(/^#/, "").toLowerCase() === selectedTag.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // Keyword search
      if (!q) return true;

      const titleMatch = entry.title.toLowerCase().includes(q);
      const summaryMatch = (entry.summary || "").toLowerCase().includes(q);
      const contentMatch = (entry.content || "").toLowerCase().includes(q);
      const tagMatch = entry.tags?.some((t) => t.toLowerCase().includes(q));

      return titleMatch || summaryMatch || contentMatch || tagMatch;
    });

    // Sort: Pinned first, then newest date first
    return [...filtered].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }, [initialEntries, searchQuery, selectedTag]);

  return (
    <div className="w-full max-w-3xl lg:max-w-4xl mx-auto space-y-6">
      {/* ── Toolbar: Sleek Search Bar & Active Tag Filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/10">
        {/* Compact Search Bar */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-black/40">
            <Search className="w-3.5 h-3.5 stroke-[2]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, tags, ideas..."
            className="w-full pl-8 pr-8 py-1.5 h-8 bg-white/80 border border-black/15 focus:border-neutral-800 focus:bg-white rounded-[3px] text-xs font-mono text-black placeholder:text-black/40 focus:outline-none transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-black/40 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Info: Post Count & Active Tag Indicator */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          {selectedTag ? (
            <div className="flex items-center space-x-1.5 bg-neutral-900 text-white px-2.5 py-1 rounded-[2px] shadow-2xs">
              <Hash className="w-3 h-3 text-white/60" />
              <span>#{selectedTag}</span>
              <button
                onClick={() => setSelectedTag(null)}
                className="hover:text-amber-300 ml-1 cursor-pointer"
                title="Clear tag filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="text-black/50 text-[11px]">
              {sortedAndFiltered.length} {sortedAndFiltered.length === 1 ? "post" : "posts"} in feed
            </span>
          )}
        </div>
      </div>

      {/* ── Single-Column Social Feed Stream ── */}
      {sortedAndFiltered.length === 0 ? (
        <div className="border border-dashed border-black/20 p-12 text-center space-y-3 bg-white/40 rounded-[4px]">
          <p className="font-sans text-base text-black font-medium">
            No posts found matching your criteria
          </p>
          <p className="font-mono text-xs text-black/50">
            Try adjusting your search query or clearing the active hashtag filter.
          </p>
          {(searchQuery || selectedTag) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag(null);
              }}
              className="mt-2 px-3 py-1.5 bg-neutral-900 text-white text-xs font-mono rounded-[2px] hover:bg-black transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedAndFiltered.map((entry) => (
            <FeedPostCard
              key={entry.id}
              entry={entry}
              onTagClick={(tag) => setSelectedTag(tag === selectedTag ? null : tag)}
              activeTag={selectedTag}
            />
          ))}
        </div>
      )}
    </div>
  );
}
