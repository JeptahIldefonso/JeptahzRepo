"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Info, Compass, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IntroHero() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 inset-x-0 z-20 flex items-center justify-between p-6 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Top-Left: Brand & Subtitle */}
        <div className="flex items-center space-x-3">
          {/* Pixel Cloud / Brand Icon */}
          <div className="h-8 w-10 flex items-center justify-center bg-fg text-bg-raised rounded-[4px] shadow-xs">
            <span className="font-mono text-[10px] font-bold tracking-tight">JR</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-sans font-semibold text-sm sm:text-base text-fg tracking-tight leading-tight">
              JeptahzRepo
            </span>
            <span className="font-mono text-[11px] text-fg-subtle tracking-wide leading-tight">
              RepoArchives
            </span>
          </div>
        </div>

        {/* Upper-Right Corner: Navigation for /hub */}
        <div>
          <Link
            href="/hub"
            className="group flex items-center space-x-1.5 font-sans text-xs text-fg-subtle hover:text-fg transition-colors font-medium bg-bg-raised/70 border border-border/70 backdrop-blur-xs px-3 py-1.5 rounded-[4px] shadow-xs"
          >
            <span>Visit /hub</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>

      {/* Middle Center Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-28 pb-16 text-center max-w-xl mx-auto w-full">
        {/* Eyebrow */}
        <div className="font-sans text-xs text-fg-subtle mb-2 tracking-wide">
          Open Knowledge Archive
        </div>

        {/* Main Headline */}
        <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-fg tracking-tight leading-tight mb-3">
          Welcome to <span className="italic font-normal">JeptahzRepo</span>
        </h1>

        {/* Short Definition */}
        <p className="text-xs sm:text-sm text-fg-muted font-normal max-w-md mx-auto leading-relaxed mb-8">
          A wholesome community repository of computer science theory, production application showcases, and curriculum roadmaps.
        </p>

        {/* Center Box Panel Card */}
        <div className="w-full bg-white border border-border/80 shadow-sm rounded-[10px] p-6 sm:p-7 text-left space-y-5">
          {/* Inside Info Callout Box */}
          <div className="bg-bg/60 border border-border/70 rounded-[6px] p-4 text-xs text-fg-muted flex items-start space-x-3 leading-relaxed">
            <Info className="w-4 h-4 text-fg shrink-0 mt-0.5 stroke-[1.5]" />
            <div className="space-y-1">
              <span className="font-medium text-fg block">
                Public Community Repository
              </span>
              <p className="text-[11px] text-fg-muted leading-normal">
                Direct access to verified application downloads, algorithm proofs, and university study guides.
              </p>
            </div>
          </div>

          {/* Subtext Prompt */}
          <div className="text-xs text-fg-subtle font-mono">
            Direct archive entry:
          </div>

          {/* Full-Width Action Button */}
          <Link href="/hub" className="block w-full">
            <Button
              size="lg"
              className="w-full h-11 bg-fg text-bg-raised hover:bg-fg/90 rounded-[6px] text-xs font-mono uppercase tracking-[0.14em] flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
            >
              <FolderGit2 className="w-4 h-4 stroke-[1.5]" />
              <span>Enter Community Archive</span>
            </Button>
          </Link>

          {/* Fine Print Note Below Button */}
          <p className="text-[10px] text-fg-subtle text-center font-mono pt-1">
            Free and open access &bull; Offline resilient &bull; Zero tracking
          </p>
        </div>
      </main>

      {/* Subtle Footer Spacing */}
      <footer className="relative z-10 p-4 text-center font-mono text-[10px] text-fg-subtle">
        J E P T A H Z R E P O &bull; 2 0 2 6
      </footer>
    </div>
  );
}
