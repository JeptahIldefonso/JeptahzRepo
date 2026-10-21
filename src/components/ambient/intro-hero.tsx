"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CornerDownRight } from "lucide-react";
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
    <div className="relative z-10 flex min-h-screen flex-col justify-between p-6 sm:p-10 md:p-16 max-w-7xl mx-auto">
      {/* Top Broadsheet Masthead Header */}
      <header className="border-b-2 border-fg pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-editorial text-fg-subtle mb-1">
            Volume I &bull; Open Knowledge Vault
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-fg leading-none">
            JeptahzRepo
          </h1>
        </div>

        <div className="text-right sm:max-w-xs font-mono text-[11px] text-fg-subtle space-y-1">
          <div>Computer Science &bull; Systems Architecture</div>
          <div>Published for Students & Software Engineers</div>
        </div>
      </header>

      {/* Middle Asymmetric Content Columns */}
      <div className="py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-8 space-y-6">
          <p className="font-editorial text-2xl sm:text-3xl md:text-4xl text-fg font-normal leading-snug">
            An open documentary and digital repository of software architectures,
            algorithm proofs, university curricula, and engineering logs.
          </p>

          <p className="text-sm sm:text-base text-fg-muted font-normal max-w-xl leading-relaxed">
            Maintained by a computer science student and software builder. Built with zero
            commercial clutter, open verification, and direct downloadable binaries.
          </p>

          {/* Primary Action Button */}
          <div className="pt-4 flex items-center space-x-4">
            <Link href="/home">
              <Button size="lg" className="px-8 h-12 text-xs">
                <span>Enter Community Archive</span>
              </Button>
            </Link>
            <span className="font-mono text-[11px] text-fg-subtle">
              No authentication required
            </span>
          </div>
        </div>

        {/* Right Asymmetric Telemetry Column */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-8 space-y-4 font-mono text-xs">
          <div className="text-fg font-medium uppercase tracking-wider text-[11px] border-b border-border pb-2">
            Index Registry
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-fg-subtle">Applications Showcase:</span>
              <span className="text-fg font-medium">{String(stats.appsCount).padStart(2, "0")} builds</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-fg-subtle">Documentation & Theory:</span>
              <span className="text-fg font-medium">{String(stats.docsCount).padStart(2, "0")} papers</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-fg-subtle">Curricula & Syllabi:</span>
              <span className="text-fg font-medium">{String(stats.coursesCount).padStart(2, "0")} modules</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-fg-subtle">Raw Ideas & Devlogs:</span>
              <span className="text-fg font-medium">{String(stats.ideasCount).padStart(2, "0")} entries</span>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-2 text-[10px] text-fg-subtle">
            <span className="h-2 w-2 rounded-full bg-fg" />
            <span>Vault Operational &bull; Drizzle + Supabase Layer</span>
          </div>
        </div>
      </div>

      {/* Bottom Broadsheet Rule & Footer Attribution */}
      <footer className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between font-mono text-[11px] text-fg-subtle gap-2">
        <div>DESIGNED WITH MONOCHROMATIC RESTRAINT &bull; NO TRACKING COOKIES</div>
        <div>EST. 2026 &bull; ALL CONTENT OPEN ACCESS</div>
      </footer>
    </div>
  );
}
