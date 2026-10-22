"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Box,
  BookOpen,
  GraduationCap,
  Code2,
  Link2,
  Lightbulb,
  User,
  Send,
  Menu,
  X,
  Search,
  Lock,
} from "lucide-react";
import { NAVIGATION_ITEMS, CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-3.5 h-3.5 stroke-[1.5]" />,
  Box: <Box className="w-3.5 h-3.5 stroke-[1.5]" />,
  BookOpen: <BookOpen className="w-3.5 h-3.5 stroke-[1.5]" />,
  GraduationCap: <GraduationCap className="w-3.5 h-3.5 stroke-[1.5]" />,
  Code2: <Code2 className="w-3.5 h-3.5 stroke-[1.5]" />,
  Link2: <Link2 className="w-3.5 h-3.5 stroke-[1.5]" />,
  Lightbulb: <Lightbulb className="w-3.5 h-3.5 stroke-[1.5]" />,
  User: <User className="w-3.5 h-3.5 stroke-[1.5]" />,
  Send: <Send className="w-3.5 h-3.5 stroke-[1.5]" />,
};

interface SidebarProps {
  onSearchOpen?: () => void;
}

export function Sidebar({ onSearchOpen }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const categories = ["browse", "explore", "more", "info"] as const;

  const renderNav = () => (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5">
      {/* Brand & Masthead */}
      <div>
        <div className="border-b border-border pb-3 mb-4">
          <Link
            href="/home"
            className="group block"
            onClick={() => setMobileOpen(false)}
          >
            <div className="font-mono text-[10px] tracking-widest text-fg-subtle uppercase">
              JeptahzRepo
            </div>
            <h2 className="font-editorial text-2xl font-normal tracking-tight text-fg group-hover:text-fg/80 transition-colors">
              Community Archive
            </h2>
          </Link>

          {/* Quick Search Trigger */}
          {onSearchOpen && (
            <button
              onClick={onSearchOpen}
              className="mt-2.5 flex w-full items-center justify-between border border-border bg-bg px-2.5 py-1.5 text-xs text-fg-subtle hover:border-fg hover:text-fg transition-colors rounded-[2px] cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Search className="h-3.5 w-3.5 stroke-[1.5]" />
                <span className="font-sans text-xs">Search...</span>
              </div>
              <kbd className="font-mono text-[9px] bg-bg-raised border border-border px-1.5 py-0.5 rounded-[1px]">
                ⌘K
              </kbd>
            </button>
          )}
        </div>

        {/* High-Density Categorized Line Items */}
        <div className="space-y-4">
          {categories.map((category) => {
            const items = NAVIGATION_ITEMS.filter((item) => item.category === category);
            return (
              <div key={category} className="space-y-0.5">
                <div className="font-mono text-[9px] uppercase tracking-wider text-fg-subtle px-2 mb-1">
                  {CATEGORY_LABELS[category]}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/home" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.slug}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "group flex items-center justify-between px-2.5 py-1.5 text-xs font-sans transition-all rounded-[2px]",
                          isActive
                            ? "bg-fg text-bg-raised font-medium shadow-xs"
                            : "text-fg-muted hover:bg-bg-hover hover:text-fg"
                        )}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span
                            className={cn(
                              "transition-colors",
                              isActive ? "text-bg-raised" : "text-fg-subtle group-hover:text-fg"
                            )}
                          >
                            {ICON_MAP[item.icon] || <Box className="w-3.5 h-3.5 stroke-[1.5]" />}
                          </span>
                          <span className="tracking-tight">{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer System Status & Discreet Admin Touchpoint */}
      <div className="border-t border-border pt-3 mt-6">
        <div className="flex items-center justify-between text-[11px] font-mono text-fg-subtle">
          <div className="flex items-center space-x-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-fg" />
            <span className="tracking-wider uppercase text-[9px]">Online</span>
          </div>
          <Link
            href="/login"
            className="flex items-center space-x-1 text-[10px] text-fg-subtle hover:text-fg hover:underline transition-colors tracking-wider"
            title="Admin Login"
            onClick={() => setMobileOpen(false)}
          >
            <Lock className="w-2.5 h-2.5 stroke-[1.5]" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-bg-raised/95 px-4 py-3 backdrop-blur-md">
        <Link href="/home" className="flex items-center space-x-2">
          <span className="font-editorial text-lg text-fg font-normal">JeptahzRepo</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-[2px] p-1.5 border border-border text-fg hover:bg-bg-hover cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Off-Canvas Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-fg/40 backdrop-blur-xs">
          <div className="fixed inset-y-0 left-0 w-64 bg-bg-raised border-r border-border shadow-xl">
            {renderNav()}
          </div>
        </div>
      )}

      {/* Desktop Persistent Fixed Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col border-r border-border bg-bg-raised/70 backdrop-blur-md z-30">
        {renderNav()}
      </aside>
    </>
  );
}
