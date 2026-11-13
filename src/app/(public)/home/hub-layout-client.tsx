"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/navigation/sidebar";
import { RightFloatingPanel } from "@/components/navigation/right-floating-panel";
import type { ChangelogItem, ChangelogBannerConfig } from "@/lib/floating-panel-data";

const CommandMenu = dynamic(
  () =>
    import("@/components/navigation/command-menu").then(
      (mod) => mod.CommandMenu
    ),
  { ssr: false }
);

interface HubLayoutClientProps {
  children: React.ReactNode;
  searchItems: Array<{
    id: string;
    title: string;
    type: string;
    slug: string;
    href: string;
  }>;
  initialChangelog?: ChangelogItem[];
  initialBanner?: ChangelogBannerConfig;
}

export function HubLayoutClient({
  children,
  searchItems,
  initialChangelog,
  initialBanner,
}: HubLayoutClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Exclude right floating panel on projects, portfolio & about, and contact
  const isExcluded =
    pathname.startsWith("/home/apps") ||
    pathname.startsWith("/home/about") ||
    pathname.startsWith("/home/contact");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("floating_sidebar_collapsed");
      if (stored === "true") {
        setSidebarCollapsed(true);
      }
    } catch {}
  }, []);

  // Keyboard shortcut listener to mount and toggle command palette on demand
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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

      {/* Global Command Palette (Lazy loaded on demand) */}
      {searchOpen && (
        <CommandMenu
          open={searchOpen}
          onOpenChange={setSearchOpen}
          items={searchItems}
        />
      )}

      {/* Main Content Area */}
      <main
        className={`flex flex-col min-h-screen w-full transition-all duration-300 relative ${
          sidebarCollapsed ? "pl-0" : "lg:pl-56"
        }`}
      >
        <div className="w-full flex-1 flex justify-center py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl flex gap-8 xl:gap-10 items-start justify-center">
            {/* Primary Content Stream */}
            <div
              className={`w-full min-w-0 ${
                isExcluded ? "max-w-5xl mx-auto" : "flex-1 max-w-3xl"
              }`}
            >
              {children}
            </div>

            {/* In-Page Right Side Changelog Rail */}
            {!isExcluded && (
              <aside className="hidden xl:block w-[280px] shrink-0 sticky top-8">
                <RightFloatingPanel
                  initialItems={initialChangelog}
                  initialBanner={initialBanner}
                />
              </aside>
            )}
          </div>
        </div>

        {/* Global Hub Footer (Styled in requested #041a24 color) */}
        <footer className="w-full mt-auto bg-[#041a24] text-white/80 border-t border-[#041a24]">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
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
