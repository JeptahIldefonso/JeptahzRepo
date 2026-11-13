"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IntroHero() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between text-white selection:bg-white selection:text-[#041a24]">
      {/* ── Top Navigation Bar ── */}
      <header className="fixed top-0 inset-x-0 z-20 flex items-center justify-between p-6 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Top-Left: Brand & Subtitle */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm ring-1 ring-white/50 shrink-0 bg-[#09251b]">
            <Image
              src="/avatar.png"
              alt="JeptahzRepo"
              width={36}
              height={36}
              priority
              className="w-full h-full object-cover"
            />
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
            className="group flex items-center space-x-1.5 font-sans text-xs text-white/90 hover:text-white transition-all font-medium bg-black/25 hover:bg-black/45 border border-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-[4px] shadow-sm"
          >
            <span>Visit /hub</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>

      {/* ── Middle Center Content Area & Obsidian Glass Card ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-14 text-center max-w-lg mx-auto w-full">
        {/* Eyebrow */}
        <div className="font-mono text-xs sm:text-[13px] text-white/80 mb-3 tracking-[0.25em] uppercase font-medium drop-shadow-xs">
          OPEN KNOWLEDGE ARCHIVE
        </div>

        {/* Main Headline */}
        <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-white tracking-tight leading-tight mb-8 drop-shadow-md">
          Welcome to <span className="italic font-normal">JeptahzRepo</span>
        </h1>

        {/* Center Formal Obsidian Glass Card */}
        <div className="relative w-full max-w-[360px] sm:max-w-[390px] bg-[#041a24]/85 hover:bg-[#041a24]/90 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[10px] p-8 sm:p-9 flex flex-col items-center justify-center space-y-6 transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent overflow-hidden">
          {/* Center Profile Avatar */}
          <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden shadow-lg ring-1 ring-white/25 shrink-0 bg-[#09251b]">
            <Image
              src="/avatar.png"
              alt="JeptahzRepo"
              width={80}
              height={80}
              priority
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Identity */}
          <div className="relative z-10 text-center space-y-1">
            <div className="font-editorial italic text-3xl sm:text-4xl text-white font-normal leading-tight drop-shadow-sm">
              JeptahzRepo
            </div>
            <div className="font-mono text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-white/60 font-medium">
              PERSONAL ARCHIVE &amp; DEVLOGS
            </div>
          </div>

          {/* Full-Width High-Contrast Action Button */}
          <Link href="/home" className="relative z-10 block w-full">
            <Button
              size="lg"
              className="w-full h-12 bg-white text-[#041a24] hover:bg-neutral-100 font-mono text-xs uppercase tracking-[0.16em] font-semibold rounded-[4px] shadow-md flex items-center justify-center space-x-2.5 cursor-pointer transition-transform active:scale-[0.98]"
            >
              <FolderGit2 className="w-4 h-4 stroke-[1.8]" />
              <span>ENTER BLOG ARCHIVE</span>
            </Button>
          </Link>

          {/* Footer Meta */}
          <p className="relative z-10 text-[10px] sm:text-[11px] text-white/45 text-center font-mono tracking-wide">
            Open Access &bull; Notes &amp; Systems &bull; Devlogs
          </p>
        </div>
      </main>

      {/* ── Subtle Footer Spacing ── */}
      <footer className="relative z-10 p-5 text-center font-mono text-[11px] text-white/65 drop-shadow-xs flex items-center justify-center space-x-3">
        <span className="font-editorial italic text-xs tracking-normal text-white">
          JeptahzRepo
        </span>
        <span>&bull;</span>
        <span>2026 Archive</span>
        <span>&bull;</span>
        <Link href="/admin" className="text-white/60 hover:text-white transition-colors">
          Studio
        </Link>
      </footer>
    </div>
  );
}
