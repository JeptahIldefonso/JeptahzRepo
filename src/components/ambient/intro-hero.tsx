"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IntroHero() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 inset-x-0 z-20 flex items-center justify-between p-6 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Top-Left: Brand & Subtitle */}
        <div className="flex items-center space-x-3">
          {/* Top-Left Avatar / Brand Icon */}
          <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm ring-1 ring-white/60 shrink-0">
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

        {/* Center Formal Obsidian Glass Card */}
        <div className="relative w-full max-w-[360px] sm:max-w-[380px] bg-[#041a24]/80 hover:bg-[#041a24]/90 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[6px] p-7 sm:p-8 flex flex-col items-center justify-center space-y-5 transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent overflow-hidden">
          {/* Center Profile Avatar */}
          <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden shadow-md ring-1 ring-white/20 shrink-0">
            <Image
              src="/avatar.png"
              alt="JeptahzRepo"
              width={64}
              height={64}
              priority
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Identity */}
          <div className="relative z-10 text-center space-y-1">
            <div className="font-editorial italic text-2xl sm:text-3xl text-white font-normal leading-tight">
              JeptahzRepo
            </div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/55">
              Personal Archive &amp; Devlogs
            </div>
          </div>

          {/* Full-Width High-Contrast Action Button */}
          <Link href="/home" className="relative z-10 block w-full">
            <Button
              size="lg"
              className="w-full h-11 bg-white text-[#041a24] hover:bg-neutral-100 font-mono text-xs uppercase tracking-[0.15em] font-semibold rounded-[3px] shadow-sm flex items-center justify-center space-x-2 cursor-pointer transition-transform active:scale-[0.98]"
            >
              <FolderGit2 className="w-4 h-4 stroke-[1.75]" />
              <span>Enter Blog Archive</span>
            </Button>
          </Link>

          {/* Footer Meta */}
          <p className="relative z-10 text-[10px] text-white/40 text-center font-mono">
            Open Access &bull; Notes &amp; Systems &bull; Devlogs
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
