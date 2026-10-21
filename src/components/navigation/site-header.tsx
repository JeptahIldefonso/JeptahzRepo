"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "OVERVIEW" },
  { href: "/home/apps", label: "PROJECTS" },
  { href: "/home/docs", label: "DOCS" },
  { href: "/home/courses", label: "COURSES" },
  { href: "/home/ideas", label: "IDEAS" },
  { href: "/home/about", label: "ABOUT" },
  { href: "/home/contact", label: "CONTACT" },
];

interface SiteHeaderProps {
  onSearchOpen?: () => void;
}

export function SiteHeader({ onSearchOpen }: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/10 bg-[#F2F2F2]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand Left */}
        <div className="flex items-center space-x-6">
          <Link
            href="/home"
            className="font-mono text-sm tracking-[0.25em] font-medium text-black hover:opacity-70 transition-opacity"
          >
            JEPTAH.Z
          </Link>

          {/* Quick Search Trigger */}
          {onSearchOpen && (
            <button
              onClick={onSearchOpen}
              className="hidden lg:flex items-center space-x-2 border border-black/15 bg-white/50 px-2.5 py-1 text-xs text-black/60 hover:text-black hover:border-black/40 transition-colors rounded-[2px]"
              title="Search repository (⌘K)"
            >
              <Search className="w-3 h-3 stroke-[1.5]" />
              <span className="font-mono text-[10px] tracking-wider">SEARCH</span>
              <kbd className="font-mono text-[9px] bg-black/5 px-1 rounded-[2px] ml-1 text-black/50">⌘K</kbd>
            </button>
          )}
        </div>

        {/* Center Nav Links with active indicator */}
        <nav className="hidden md:flex items-center space-x-6">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/home" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "font-mono text-xs tracking-wider transition-colors py-1 relative",
                  isActive
                    ? "text-black font-semibold border-b-2 border-black"
                    : "text-black/60 hover:text-black"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Mono Indicator & Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          {onSearchOpen && (
            <button
              onClick={onSearchOpen}
              className="lg:hidden p-1.5 text-black/70 hover:text-black"
              aria-label="Search"
            >
              <Search className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}

          <div className="flex items-center space-x-1.5 font-mono text-xs select-none">
            <span className="font-semibold text-black">MONO</span>
            <span className="text-black/30">/</span>
            <span className="text-black/40">VIBRANT</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-black/80 hover:text-black"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[1.5]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[1.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-black/15 bg-[#F2F2F2] px-6 py-4 space-y-3 font-mono text-xs">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/home" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block py-1.5 transition-colors tracking-wider",
                  isActive
                    ? "text-black font-semibold underline"
                    : "text-black/70 hover:text-black"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
