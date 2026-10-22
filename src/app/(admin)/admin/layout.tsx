import React from "react";
import Link from "next/link";
import { Shield, ExternalLink, LogOut, Layers, Box, FileText } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg-raised/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="h-2 w-2 rounded-full bg-fg" />
            <Link
              href="/admin"
              className="font-sans font-bold text-base sm:text-lg text-fg tracking-tight hover:opacity-80 transition-opacity"
            >
              JeptahzRepo
            </Link>
            <span className="font-mono text-[10px] text-fg-subtle border border-border px-2 py-0.5 rounded-[4px] bg-bg hidden sm:inline-block">
              Editing
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs sm:text-sm font-mono">
            <Link
              href="/home"
              target="_blank"
              className="flex items-center space-x-1.5 text-fg-subtle hover:text-fg transition-colors"
            >
              <span>Live Archive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/login"
              className="flex items-center space-x-1.5 text-fg-subtle hover:text-fg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Surface */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
