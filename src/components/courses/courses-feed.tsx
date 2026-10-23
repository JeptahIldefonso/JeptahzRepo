"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Hash, GraduationCap, Filter } from "lucide-react";
import { EntryType } from "@/db/data-provider";
import { CourseGuideCard } from "@/components/courses/course-guide-card";

interface CoursesFeedProps {
  initialEntries: EntryType[];
}

export function CoursesFeed({ initialEntries }: CoursesFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique course tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    initialEntries.forEach((entry) => {
      entry.tags?.forEach((tag) => set.add(tag.replace(/^#/, "")));
    });
    return Array.from(set);
  }, [initialEntries]);

  // Sorting: Pinned first, then newest dates first (descending)
  const sortedAndFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = initialEntries.filter((entry) => {
      // Tag filter
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

    return [...filtered].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }, [initialEntries, searchQuery, selectedTag]);

  return (
    <div className="w-full space-y-6">
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
            placeholder="Search curricula, codes, syllabi..."
            className="w-full pl-8 pr-8 py-1.5 h-8 bg-white/80 border border-black/15 focus:border-[#041a24] focus:bg-white rounded-[3px] text-xs font-mono text-black placeholder:text-black/40 focus:outline-none transition-all shadow-2xs"
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

        {/* Right Info: Curricula Count & Active Tag Indicator */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          {selectedTag ? (
            <div className="flex items-center space-x-1.5 bg-[#041a24] text-white px-2.5 py-1 rounded-[2px] shadow-2xs">
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
              {sortedAndFiltered.length} CURRICUL{sortedAndFiltered.length === 1 ? "UM" : "A"}
            </span>
          )}
        </div>
      </div>

      {/* ── Topic Tag Filter Bar (if tags exist) ── */}
      {allTags.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
          <span className="text-black/40 text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            <span>Topics:</span>
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2 py-0.5 rounded-[3px] text-[11px] transition-colors shrink-0 cursor-pointer ${
              selectedTag === null
                ? "bg-black text-white font-medium"
                : "bg-black/5 text-black/60 hover:text-black hover:bg-black/10"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded-[3px] text-[11px] transition-colors shrink-0 cursor-pointer ${
                selectedTag === tag
                  ? "bg-black text-white font-medium"
                  : "bg-black/5 text-black/60 hover:text-black hover:bg-black/10"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* ── Formal & Technical Curricula Stream ── */}
      {sortedAndFiltered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-black/15 rounded-[4px] bg-white/40 space-y-3">
          <GraduationCap className="w-8 h-8 text-black/30 mx-auto stroke-[1.25]" />
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-base text-black">No Course Curricula Found</h3>
            <p className="text-xs font-mono text-black/50 max-w-sm mx-auto">
              {searchQuery || selectedTag
                ? "No course modules match your search criteria. Try a different search term or topic filter."
                : "There are currently no course syllabi in the academic repository. Add course guides in the Admin Panel."}
            </p>
          </div>
          {(searchQuery || selectedTag) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag(null);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-[2px] bg-[#041a24] text-white font-mono text-xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedAndFiltered.map((entry) => (
            <CourseGuideCard
              key={entry.id}
              entry={entry}
              onTagClick={(tag) => setSelectedTag(tag)}
              activeTag={selectedTag}
            />
          ))}
        </div>
      )}
    </div>
  );
}
