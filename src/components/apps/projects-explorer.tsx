"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, X, ExternalLink, Code2, ArrowRight, Sparkles } from "lucide-react";
import { AppType } from "@/db/data-provider";
import { Badge } from "@/components/ui/badge";

interface ProjectsExplorerProps {
  initialApps: AppType[];
}

export function ProjectsExplorer({ initialApps }: ProjectsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTech, setSelectedTech] = useState<string>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut to focus search: '/' or 'Cmd+K' / 'Ctrl+K'
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (
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

  // Extract all unique categories and tech stacks
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialApps.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [initialApps]);

  const allTechStacks = useMemo(() => {
    const set = new Set<string>();
    initialApps.forEach((a) => {
      a.tech_stack?.forEach((t) => set.add(t));
    });
    return Array.from(set).slice(0, 8); // Top tags
  }, [initialApps]);

  // Live real-time search filtering with multi-word & punctuation-insensitive matching
  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialApps.filter((app) => {
      // Category filter
      if (selectedCategory !== "all" && app.category !== selectedCategory) {
        return false;
      }

      // Tech stack filter
      if (selectedTech !== "all" && !app.tech_stack?.includes(selectedTech)) {
        return false;
      }

      // Search query filter (matches title, slug, tagline, description, tech stack)
      if (!q) return true;

      const cleanQ = q.replace(/[^a-z0-9]/g, "");
      const cleanTitle = app.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanSlug = app.slug.toLowerCase().replace(/[^a-z0-9]/g, "");

      const searchable = `${app.title} ${app.slug} ${app.tagline} ${app.description || ""} ${app.category} ${(app.tech_stack || []).join(" ")}`.toLowerCase();
      const tokens = q.split(/\s+/).filter(Boolean);
      const tokensMatch = tokens.length > 0 && tokens.every((tok) => searchable.includes(tok));

      const normalizedMatch =
        cleanQ.length > 0 && (cleanTitle.includes(cleanQ) || cleanSlug.includes(cleanQ));

      return tokensMatch || normalizedMatch;
    });
  }, [initialApps, searchQuery, selectedCategory, selectedTech]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedTech("all");
  };

  return (
    <div className="space-y-8">
      {/* ── Top Header with Watermark matching JeptahPortfolio ── */}
      <div className="relative pt-2 pb-6 border-b border-black/10 overflow-hidden">
        {/* Soft Background Watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.06] font-cinzel text-7xl sm:text-9xl font-black uppercase text-black tracking-tighter">
          PROJECTS
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/50">
              PORTFOLIO // SHOWCASE
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-black">
              Projects
            </h1>
            <p className="text-xs sm:text-sm text-black/70 max-w-lg leading-relaxed">
              Software applications, mobile utilities, and developer tools built with clean architecture.
            </p>
          </div>

          <div className="font-mono text-xs text-black/60 shrink-0">
            {filteredApps.length} {filteredApps.length === 1 ? "project" : "projects"}
          </div>
        </div>
      </div>

      {/* ── Modern Minimalist Toolbar: Search on Left, Filters & Tags on Right ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-1">
        {/* Compact Minimal Search Input (Positioned on Left) */}
        <div className="relative w-full sm:w-56 md:w-64 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-black/40">
            <Search className="w-3.5 h-3.5 stroke-[2]" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-8 pr-9 py-1 h-7.5 bg-white/80 border border-black/15 focus:border-neutral-800 focus:bg-white rounded-[3px] text-[11px] font-mono text-black placeholder:text-black/40 focus:outline-none transition-all shadow-2xs"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-black/40 hover:text-black transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block font-mono text-[9px] text-black/40 bg-black/5 px-1 py-0.5 rounded border border-black/10">
                /
              </kbd>
            </div>
          )}
        </div>

        {/* Right Side: Filters (Top) and Tags (Directly Below Filters) */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 w-full">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center sm:justify-end gap-1 text-[11px] font-mono">
            <span className="text-[10px] tracking-wider text-black/40 uppercase mr-1">
              Category:
            </span>

            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedTech("all");
              }}
              className={`px-2.5 py-0.5 rounded-[5px] transition-all duration-150 cursor-pointer ${
                selectedCategory === "all" && selectedTech === "all"
                  ? "bg-neutral-800 text-white font-medium border border-neutral-800"
                  : "bg-white/60 border border-black/15 text-black/70 hover:bg-neutral-800 hover:text-white hover:border-neutral-800"
              }`}
            >
              All ({initialApps.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat ? "all" : cat);
                }}
                className={`px-2.5 py-0.5 rounded-[5px] transition-all duration-150 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-neutral-800 text-white font-medium border border-neutral-800"
                    : "bg-white/60 border border-black/15 text-black/70 hover:bg-neutral-800 hover:text-white hover:border-neutral-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tech Stack Pills (Positioned on Right Side Below Filters) */}
          <div className="flex flex-wrap items-center sm:justify-end gap-1 text-[10px] font-mono">
            <span className="text-[10px] tracking-wider text-black/35 uppercase mr-1">
              Tags:
            </span>
            {allTechStacks.map((tech) => (
              <button
                key={tech}
                onClick={() => {
                  setSelectedTech(selectedTech === tech ? "all" : tech);
                }}
                className={`px-1.5 py-0.5 rounded-[4px] transition-all duration-150 cursor-pointer ${
                  selectedTech === tech
                    ? "bg-neutral-800 text-white font-medium border border-neutral-800"
                    : "bg-black/[0.03] border border-black/10 text-black/60 hover:bg-neutral-800 hover:text-white hover:border-neutral-800"
                }`}
              >
                {tech}
              </button>
            ))}

            {(searchQuery || selectedCategory !== "all" || selectedTech !== "all") && (
              <button
                onClick={resetFilters}
                className="ml-1 text-[10px] text-black/60 hover:text-neutral-900 underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Project Cards Grid Matching JeptahPortfolio Screenshot ── */}
      {filteredApps.length === 0 ? (
        <div className="border border-dashed border-black/20 p-12 text-center space-y-3 bg-white/40 rounded-[2px]">
          <p className="font-sans text-base text-black font-medium">
            No projects found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="font-mono text-xs text-black/50">
            Try adjusting your search terms or clearing your filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 px-3 py-1.5 bg-black text-white text-xs font-mono rounded-[2px] hover:bg-black/85 transition-colors cursor-pointer"
          >
            Show All Projects
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          {filteredApps.map((app) => {
            const previewUrl = app.carousel_images[0]?.url || "";
            const demoUrl = app.demo_url || app.gdrive_url;
            const repoUrl = app.repo_url;

            return (
              <article
                key={app.id}
                className="group border border-black/15 bg-white/70 backdrop-blur-xs rounded-[6px] overflow-hidden flex flex-col justify-between hover:border-black/50 transition-all duration-200 shadow-2xs"
              >
                {/* Media Viewport */}
                <Link
                  href={`/home/apps/${app.slug}`}
                  className="block relative w-full h-56 sm:h-60 bg-black/[0.02] border-b border-black/10 p-4 overflow-hidden"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={app.title}
                      loading="lazy"
                      className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-xs text-black/40">
                      No Preview Available
                    </div>
                  )}
                </Link>

                {/* Card Content Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <Link href={`/home/apps/${app.slug}`}>
                      <h2 className="font-sans text-xl font-bold text-black hover:opacity-75 transition-opacity">
                        {app.title}
                      </h2>
                    </Link>
                    <p className="text-xs sm:text-sm text-black/70 leading-relaxed font-normal line-clamp-3">
                      {app.tagline}
                    </p>
                  </div>

                  {/* Tech Stack Chips */}
                  {app.tech_stack && app.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[10px]">
                      {app.tech_stack.map((t) => (
                        <span
                          key={t}
                          className="border border-black/15 bg-black/[0.03] px-2 py-0.5 text-black/80 rounded-[2px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons Row matching screenshot (DEMO, GITHUB, INFO) */}
                  <div className="border-t border-black/10 pt-4 flex flex-wrap items-center gap-2 font-mono text-xs">
                    {demoUrl && (
                      <a
                        href={demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-black text-white hover:bg-black/80 px-3.5 py-1.5 text-[11px] uppercase tracking-wider font-medium rounded-[4px] transition-colors"
                      >
                        DEMO
                      </a>
                    )}

                    {repoUrl && (
                      <a
                        href={repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-black/25 hover:border-black bg-white/60 hover:bg-white px-3 py-1.5 text-[11px] uppercase tracking-wider text-black transition-colors rounded-[4px]"
                      >
                        GITHUB
                      </a>
                    )}

                    <Link
                      href={`/home/apps/${app.slug}`}
                      className="border border-black/25 hover:border-black bg-white/60 hover:bg-white px-3 py-1.5 text-[11px] uppercase tracking-wider text-black transition-colors rounded-[4px] ml-auto"
                    >
                      INFO
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
