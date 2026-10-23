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

      {/* Main Content Area: Centered with symmetric gutters so it NEVER overlaps the floating sidebar */}
      <main
        className={`flex flex-col min-h-screen w-full transition-all duration-300 ${
          sidebarCollapsed
            ? "px-4 sm:px-8"
            : "px-4 sm:px-6 xl:pl-[284px] xl:pr-[284px]"
        }`}
      >
        <div className="flex-1 py-8 sm:py-10 md:py-12 w-full max-w-[940px] mx-auto flex flex-col">
          {children}
        </div>

        {/* Global Hub Footer */}
        <footer className="border-t border-border px-4 py-6 max-w-[940px] w-full mx-auto font-mono text-[11px] text-fg-subtle flex flex-col sm:flex-row items-center justify-between gap-2">
          <div><span className="font-editorial italic text-sm text-fg tracking-normal">JeptahzRepo</span> &bull; COMMUNITY ARCHIVE</div>
          <div>EST. 2026 &bull; ALL RIGHTS RESERVED</div>
        </footer>
      </main>
    </div>
  );
}
