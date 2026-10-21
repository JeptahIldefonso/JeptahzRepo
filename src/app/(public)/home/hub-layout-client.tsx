"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { CommandMenu } from "@/components/navigation/command-menu";

interface HubLayoutClientProps {
  children: React.ReactNode;
  searchItems: Array<{
    id: string;
    title: string;
    type: string;
    slug: string;
    href: string;
  }>;
}

export function HubLayoutClient({ children, searchItems }: HubLayoutClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      {/* Sidebar with Search Callback */}
      <Sidebar onSearchOpen={() => setSearchOpen(true)} />

      {/* Global Command Palette */}
      <CommandMenu
        open={searchOpen}
        onOpenChange={setSearchOpen}
        items={searchItems}
      />

      {/* Main Content Area */}
      <main className="lg:pl-68 flex flex-col min-h-screen">
        <div className="flex-1 px-4 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12 max-w-6xl w-full mx-auto">
          {children}
        </div>

        {/* Global Hub Footer */}
        <footer className="border-t border-border px-4 py-6 sm:px-8 md:px-12 max-w-6xl w-full mx-auto font-mono text-[11px] text-fg-subtle flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>JEPTAHZREPO &bull; COMPUTER SCIENCE KNOWLEDGE ARCHIVE</div>
          <div>EST. 2026 &bull; BUILT FOR ARCHITECTS & STUDENTS</div>
        </footer>
      </main>
    </div>
  );
}
