"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GitCommit, ArrowUpRight } from "lucide-react";
import {
  INITIAL_CHANGELOG_DATA,
  ChangelogItem,
} from "@/lib/floating-panel-data";

interface RightFloatingPanelProps {
  initialItems?: ChangelogItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  feature: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  release: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  fix: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  doc: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  system: "bg-neutral-500/20 text-neutral-300 border-neutral-500/25",
};

export function RightFloatingPanel({ initialItems }: RightFloatingPanelProps) {
  const [items, setItems] = useState<ChangelogItem[]>(
    initialItems && initialItems.length > 0
      ? initialItems
      : INITIAL_CHANGELOG_DATA.items
  );
  const [loading, setLoading] = useState(false);

  // Sync with /api/changelog on mount and listen to admin mutation broadcast
  useEffect(() => {
    let isMounted = true;

    async function fetchLatestChangelog() {
      try {
        const res = await fetch("/api/changelog", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data && Array.isArray(json.data)) {
            setItems(json.data);
          }
        }
      } catch {
        // Fallback to static seed
      }
    }

    fetchLatestChangelog();

    function handleChangelogUpdate() {
      fetchLatestChangelog();
    }

    window.addEventListener("changelog_updated", handleChangelogUpdate);
    window.addEventListener("storage", handleChangelogUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("changelog_updated", handleChangelogUpdate);
      window.removeEventListener("storage", handleChangelogUpdate);
    };
  }, []);

  return (
    <aside
      aria-label="Repository Changelog"
      className="w-full select-none animate-in fade-in duration-300"
    >
      <div className="rounded-[10px] border border-white/10 bg-[#041a24] text-white shadow-lg overflow-hidden transition-all hover:border-white/20">
        {/* ── Masthead Header (Styled matching Left Sidebar Formality) ── */}
        <div className="p-4 border-b border-white/10 flex items-start justify-between bg-[#041a24]">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5">
              <span className="font-editorial italic text-lg font-normal tracking-tight text-white leading-none">
                Changelog
              </span>
            </div>
            <div className="font-mono text-[9px] tracking-widest text-white/50 uppercase">
              Repository Stream
            </div>
          </div>

          {/* Active Live Status Indicator */}
          <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-semibold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ACTIVE</span>
          </div>
        </div>

        {/* ── Formal Timeline Stream ── */}
        <div className="p-4 space-y-4 max-h-[540px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="relative pl-3 space-y-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/15">
            {items.map((item) => {
              const categoryBadge =
                CATEGORY_COLORS[item.category] || CATEGORY_COLORS.feature;

              return (
                <div key={item.id} className="relative pl-3.5 space-y-1.5 group">
                  {/* Timeline Node Dot */}
                  <span className="absolute -left-[9px] top-1.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-[#041a24] group-hover:scale-125 transition-transform" />

                  {/* Header Row: Version Tag & Timestamp */}
                  <div className="flex items-center justify-between gap-1 text-[10px] font-mono leading-none">
                    <div className="flex items-center space-x-1">
                      {item.version_tag && (
                        <span className="px-1.5 py-0.5 rounded-[3px] font-mono text-[9px] font-bold tracking-wide uppercase bg-white/10 text-white/90">
                          {item.version_tag}
                        </span>
                      )}
                      {item.category && (
                        <span
                          className={`px-1.5 py-0.5 rounded-[3px] font-mono text-[8.5px] font-semibold uppercase tracking-wider border ${categoryBadge}`}
                        >
                          {item.category}
                        </span>
                      )}
                    </div>
                    <span className="text-white/45 font-mono text-[10px] whitespace-nowrap">
                      {item.timestamp}
                    </span>
                  </div>

                  {/* Title / Headline */}
                  <Link
                    href={item.href || "/home/docs"}
                    className="block text-xs font-sans font-medium text-white hover:text-sky-300 transition-colors leading-snug group-hover:underline"
                  >
                    {item.title}
                  </Link>

                  {/* Description preview */}
                  {item.description && (
                    <p className="text-[11px] font-sans text-white/65 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Card Footer ── */}
        <div className="px-4 py-3 bg-[#03141c] border-t border-white/10 flex items-center justify-between font-mono text-[10px]">
          <span className="text-white/40 flex items-center space-x-1">
            <GitCommit className="w-3 h-3 text-sky-400" />
            <span>{items.length} Milestones</span>
          </span>

          <Link
            href="/home/docs"
            className="text-white/60 hover:text-white transition-colors inline-flex items-center space-x-0.5"
          >
            <span>All Docs</span>
            <ArrowUpRight className="w-3 h-3 ml-0.5 opacity-70" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
