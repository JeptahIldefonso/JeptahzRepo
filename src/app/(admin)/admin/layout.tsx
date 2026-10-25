import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  AdminSessionGuard,
  AdminExitButton,
} from "@/components/admin/admin-session-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* Tab-close / Window-close Session Guard */}
      <AdminSessionGuard />

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg-raised/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="h-2 w-2 rounded-full bg-fg" />
            <Link
              href="/admin"
              className="font-editorial italic font-normal text-xl sm:text-2xl text-fg tracking-tight hover:opacity-80 transition-opacity"
            >
              JeptahzRepo
            </Link>
            <span className="font-mono text-[10px] text-fg-subtle border border-border px-2 py-0.5 rounded-[4px] bg-bg hidden sm:inline-block">
              Curator Studio
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
            <AdminExitButton />
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
