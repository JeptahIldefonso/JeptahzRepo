"use client";

import React, { useState } from "react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteRail } from "@/components/navigation/site-rail";
import { CommandMenu } from "@/components/navigation/command-menu";
import { AppType } from "@/db/data-provider";

interface HubLayoutClientProps {
  children: React.ReactNode;
  apps?: AppType[];
  searchItems: Array<{
    id: string;
    title: string;
    type: string;
    slug: string;
    href: string;
  }>;
}

export function HubLayoutClient({
  children,
  apps = [],
  searchItems,
}: HubLayoutClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent relative flex flex-col text-black selection:bg-black selection:text-white">
      {/* Top Navigation Bar Matching JeptahPortfolio */}
      <SiteHeader onSearchOpen={() => setSearchOpen(true)} />

      {/* Floating Left Connect & Projects Rail */}
      <SiteRail apps={apps} />

      {/* Global Command Palette */}
      <CommandMenu
        open={searchOpen}
        onOpenChange={setSearchOpen}
        items={searchItems}
      />

      {/* Main Content Area: Responsive spacing with rail offset on xl screens */}
      <main className="flex-1 flex flex-col w-full xl:pl-48 transition-all duration-300">
        <div className="flex-1 px-5 py-6 sm:px-10 sm:py-8 md:px-12 md:py-10 max-w-6xl w-full mx-auto">
          {children}
        </div>

        {/* Global Minimalist Footer */}
        <footer className="border-t border-black/10 px-6 py-6 sm:px-12 max-w-6xl w-full mx-auto font-mono text-[11px] text-black/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="tracking-wider">
            JEPTAHZREPO &bull; OPEN COMPUTER SCIENCE KNOWLEDGE ARCHIVE
          </div>
          <div className="tracking-widest text-[10px]">
            EST. 2026 &bull; ALL RIGHTS RESERVED
          </div>
        </footer>
      </main>
    </div>
  );
}
