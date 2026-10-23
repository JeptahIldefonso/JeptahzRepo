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
          <div className="h-8 w-10 flex items-center justify-center bg-white/90 text-[#041a24] rounded-[2px] shadow-sm backdrop-blur-xs">
            <span className="font-mono text-[10px] font-bold tracking-tight">JR</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-editorial italic text-lg sm:text-xl text-white tracking-tight leading-tight drop-shadow-sm">
              JeptahzRepo
            </span>
            <span className="font-mono text-[11px] text-white/70 tracking-wide leading-tight drop-shadow-xs">
              RepoArchives
            </span>
          </div>
        </div>

        {/* Upper-Right Corner: Navigation for /hub */}
        <div>
          <Link
            href="/home"
            className="group flex items-center space-x-1.5 font-sans text-xs text-white/90 hover:text-white transition-all font-medium bg-black/25 hover:bg-black/45 border border-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-[2px] shadow-sm"
          >
            <span>Visit /hub</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>

      {/* Middle Center Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-14 text-center max-w-lg mx-auto w-full">
        {/* Eyebrow */}
        <div className="font-mono text-xs text-white/80 mb-2 tracking-widest uppercase font-medium drop-shadow-xs">
          Open Knowledge Archive
        </div>

        {/* Main Headline */}
        <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-white tracking-tight leading-tight mb-8 drop-shadow-md">
          Welcome to <span className="italic font-normal">JeptahzRepo</span>
        </h1>

        {/* Center Pixelated Translucent Square Box Panel Card */}
        <div className="relative w-full max-w-[360px] sm:max-w-[380px] bg-white/60 hover:bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-[2px] p-7 sm:p-8 flex flex-col items-center justify-center space-y-5 transition-all duration-300">
          {/* 4 Corner Pixel Markers */}
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-[#041a24]/40 shadow-xs pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-[#041a24]/40 shadow-xs pointer-events-none" />
          <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border border-[#041a24]/40 shadow-xs pointer-events-none" />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border border-[#041a24]/40 shadow-xs pointer-events-none" />

          {/* Micro Pixel Dot Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-35 rounded-[2px]"
            style={{
              backgroundImage: "radial-gradient(rgba(4, 26, 36, 0.22) 1px, transparent 1px)",
              backgroundSize: "6px 6px",
            }}
          />

          {/* Center Pixel Logo Badge */}
          <div className="relative z-10 w-12 h-12 flex items-center justify-center bg-[#041a24] text-white rounded-[2px] shadow-sm ring-2 ring-white/70">
            <span className="font-mono text-xs font-bold tracking-widest">JR</span>
          </div>

          <div className="relative z-10 space-y-1">
            <div className="font-editorial italic text-xl text-[#041a24] font-normal leading-tight">
              Knowledge Repository
            </div>
            <p className="font-mono text-[11px] text-[#041a24]/75 tracking-wider uppercase">
              Curated Theories &amp; Code
            </p>
          </div>

          {/* Full-Width Action Button */}
          <Link href="/home" className="relative z-10 block w-full">
            <Button
              size="lg"
              className="w-full h-11 bg-[#041a24] text-white hover:bg-[#041a24]/90 rounded-[2px] text-xs font-mono uppercase tracking-[0.14em] flex items-center justify-center space-x-2 shadow-md cursor-pointer transition-transform active:scale-[0.98] border border-white/20"
            >
              <FolderGit2 className="w-4 h-4 stroke-[1.5]" />
              <span>Enter Blog Archive</span>
            </Button>
          </Link>

          {/* Fine Print Note Below Button */}
          <p className="relative z-10 text-[10px] text-[#041a24]/65 text-center font-mono">
            Free and open access
          </p>
        </div>
      </main>

      {/* Subtle Footer Spacing */}
      <footer className="relative z-10 p-4 text-center font-mono text-[10px] text-white/75 drop-shadow-xs">
        <span className="font-editorial italic text-xs tracking-normal text-white">JeptahzRepo</span> &bull; 2026
      </footer>
    </div>
  );
}
