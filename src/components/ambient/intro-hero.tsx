"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Terminal, BookOpen, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IntroHeroProps {
  stats?: {
    appsCount: number;
    docsCount: number;
    coursesCount: number;
    ideasCount: number;
  };
}

export function IntroHero({
  stats = { appsCount: 3, docsCount: 2, coursesCount: 1, ideasCount: 1 },
}: IntroHeroProps) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-2xl border border-border bg-bg-raised/95 p-8 sm:p-12 shadow-sm backdrop-blur-md transition-all">
        {/* Top Monospace Metadata Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-fg animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg">
              Vault Status: Operational
            </span>
          </div>
          <span className="font-mono text-[10px] text-fg-subtle tracking-[0.16em]">
            REV 2026.10
          </span>
        </div>

        {/* Brand Headline & Intellectual Manifesto */}
        <div className="space-y-4 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-fg-subtle">
            Computer Science Knowledge Hub & Laboratory
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-fg">
            JEPTAHZREPO
          </h1>
          <p className="text-sm sm:text-base text-fg-muted font-normal max-w-lg mx-auto leading-relaxed pt-2">
            An open documentary and digital repository of software architectures,
            algorithm breakdowns, university syllabi, and raw engineering ideas.
          </p>
        </div>

        {/* Primary Call to Action */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3">
          <Link href="/home" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-8 group">
              <span>Visit Community Hub</span>
              <ArrowRight className="ml-2 h-4 w-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
          <span className="font-mono text-[10px] text-fg-subtle tracking-[0.15em] pt-1">
            PRESS TO ENTER OPEN ARCHIVE // NO AUTH REQUIRED
          </span>
        </div>

        {/* Monospace Metric Grid */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border pt-6 text-center">
          <div className="space-y-1">
            <div className="font-mono text-xs font-semibold text-fg">
              {String(stats.appsCount).padStart(2, "0")}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-fg-subtle">
              Apps Showcase
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-xs font-semibold text-fg">
              {String(stats.docsCount).padStart(2, "0")}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-fg-subtle">
              Docs & Theory
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-xs font-semibold text-fg">
              {String(stats.coursesCount).padStart(2, "0")}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-fg-subtle">
              Curricula
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-xs font-semibold text-fg">
              {String(stats.ideasCount).padStart(2, "0")}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-fg-subtle">
              Idea Vault
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Footer Attribution */}
      <div className="relative z-10 mt-6 text-center font-mono text-[10px] text-fg-subtle tracking-wider">
        MONOCHROMATIC RAW LUXURY &bull; ZERO SLOP STANDARD
      </div>
    </div>
  );
}
