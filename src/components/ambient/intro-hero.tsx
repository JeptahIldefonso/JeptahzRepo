"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, FolderGit2 } from "lucide-react";
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
            <span className="font-editorial italic text-lg sm:text-xl text-fg tracking-tight leading-tight">
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
        <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-fg tracking-tight leading-tight mb-8">
          Welcome to <span className="italic font-normal">JeptahzRepo</span>
        </h1>

        {/* Center Box Panel Card */}
        <div className="w-full bg-white border border-border/80 shadow-sm rounded-[10px] p-6 sm:p-7 space-y-4">
          {/* Full-Width Action Button */}
          <Link href="/hub" className="block w-full">
            <Button
              size="lg"
              className="w-full h-11 bg-fg text-bg-raised hover:bg-fg/90 rounded-[6px] text-xs font-mono uppercase tracking-[0.14em] flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
            >
              <FolderGit2 className="w-4 h-4 stroke-[1.5]" />
              <span>Enter Blog Archive</span>
            </Button>
          </Link>

          {/* Fine Print Note Below Button */}
          <p className="text-[10px] text-fg-subtle text-center font-mono">
            Free and open access &bull; Offline resilient &bull; Zero tracking
          </p>
        </div>
      </main>

      {/* Subtle Footer Spacing */}
      <footer className="relative z-10 p-4 text-center font-mono text-[10px] text-[#041a24]/70">
        <span className="font-editorial italic text-xs tracking-normal text-[#041a24]">JeptahzRepo</span> &bull; 2026
      </footer>
    </div>
  );
}
