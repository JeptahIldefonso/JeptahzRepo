"use client";

import React, { useState, useEffect } from "react";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("floating_sidebar_collapsed");
      if (stored === "true") {
        setSidebarCollapsed(true);
      }
    } catch {}
  }, []);

  function handleToggleSidebar(collapsed: boolean) {
    setSidebarCollapsed(collapsed);
    try {
      localStorage.setItem("floating_sidebar_collapsed", String(collapsed));
    } catch {}
  }

  return (
    <div className="min-h-screen bg-bg relative">
      {/* Floating Desktop & Mobile Sidebar */}
      <Sidebar
        onSearchOpen={() => setSearchOpen(true)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Global Command Palette */}
      <CommandMenu
        open={searchOpen}
        onOpenChange={setSearchOpen}
        items={searchItems}
      />

      {/* Main Content Area */}
      <main
        className={`flex flex-col min-h-screen w-full transition-all duration-300 ${
          sidebarCollapsed
            ? "pl-0 pr-0"
            : "lg:pl-48 xl:pr-48"
        }`}
      >
        <div className="flex-1 py-8 sm:py-10 md:py-12 w-full max-w-[940px] mx-auto px-4 sm:px-6 flex flex-col">
          {children}
        </div>

        {/* Global Hub Footer (Styled in requested #041a24 color) */}
        <footer className="w-full mt-auto bg-[#041a24] text-white/80 border-t border-[#041a24]">
          <div className="max-w-[940px] mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2.5">
              <span className="font-editorial italic text-base text-white font-normal">
                JeptahzRepo
              </span>
              <span className="text-white/30">&bull;</span>
              <span className="text-[10px] uppercase tracking-wider text-white/70 font-sans font-medium">
                Blog Archive
              </span>
            </div>
            <div className="text-[10px] text-white/50 tracking-wider">
              EST. 2026 &bull; ALL RIGHTS RESERVED
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
