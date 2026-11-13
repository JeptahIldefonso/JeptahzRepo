"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  GitCommit,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  AppType,
  EntryType,
  ChangelogItem,
  ChangelogBannerType,
} from "@/db/data-provider";
import { AdminManager } from "@/app/(admin)/admin/admin-manager";
import { PublishPanel } from "@/components/admin/publish-panel";
import { InquiriesPanel } from "@/components/admin/inquiries-panel";
import { AuditPanel } from "@/components/admin/audit-panel";

export type StudioView = "content" | "publish" | "inquiries" | "audit";

interface AdminStudioShellProps {
  initialApps: AppType[];
  initialEntries: EntryType[];
  initialChangelog: ChangelogItem[];
  initialBanner?: ChangelogBannerType;
}

export function AdminStudioShell({
  initialApps,
  initialEntries,
  initialChangelog,
  initialBanner,
}: AdminStudioShellProps) {
  const [currentView, setCurrentView] = useState<StudioView>("content");
  const [unreadInquiriesCount, setUnreadInquiriesCount] = useState<number>(0);

  // Sync initial view from URL query param (?view=publish|inquiries|audit|content)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view") as StudioView | null;
      if (
        viewParam &&
        ["content", "publish", "inquiries", "audit"].includes(viewParam)
      ) {
        setCurrentView(viewParam);
      }
    }
  }, []);

  // Poll or check unread inquiries count to show a helpful badge
  useEffect(() => {
    let isMounted = true;
    async function checkInquiries() {
      try {
        const res = await fetch("/api/admin/inquiries", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.inquiries)) {
            const unread = data.inquiries.filter(
              (i: { status?: string }) => !i.status || i.status === "new"
            ).length;
            setUnreadInquiriesCount(unread);
          }
        }
      } catch {
        // Non-fatal badge update
      }
    }
    checkInquiries();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectView = (view: StudioView) => {
    setCurrentView(view);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (view === "content") {
        url.searchParams.delete("view");
      } else {
        url.searchParams.set("view", view);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const totalContentCount =
    initialEntries.length + initialApps.length + initialChangelog.length;

  return (
    <div className="space-y-6">
      {/* ── Studio Primary Navigation & Domain Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="font-editorial italic text-2xl sm:text-3xl font-normal text-fg tracking-tight">
              {currentView === "content" && "Content Studio"}
              {currentView === "publish" && "Publish & Git Deployment"}
              {currentView === "inquiries" && "Visitor Inquiries"}
              {currentView === "audit" && "System Audit Trail"}
            </h1>
            <span className="font-mono text-[10px] text-fg-subtle border border-border px-2 py-0.5 rounded-[4px] bg-bg-raised">
              {currentView === "content" && `${totalContentCount} items`}
              {currentView === "publish" && "Vercel + GitHub"}
              {currentView === "inquiries" && `${unreadInquiriesCount} new`}
              {currentView === "audit" && "Immutable Log"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-fg-muted mt-1">
            {currentView === "content" &&
              "Create, edit, and organize notes, projects, ideas, links, courses, and system changelog."}
            {currentView === "publish" &&
              "Verify staged database changes, review commit diffs, and publish to the live edge network."}
            {currentView === "inquiries" &&
              "Triage, review, and reply to incoming messages submitted via the visitor contact form."}
            {currentView === "audit" &&
              "Immutable trail of all content mutations, administrative actions, and deployment events."}
          </p>
        </div>

        {/* Primary View Switcher Navigation */}
        <nav
          aria-label="Admin Studio Views"
          className="flex items-center p-1 bg-bg-subtle border border-border rounded-[6px] text-xs font-mono shrink-0 self-start sm:self-auto overflow-x-auto max-w-full"
        >
          <button
            onClick={() => handleSelectView("content")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[4px] transition-all cursor-pointer ${
              currentView === "content"
                ? "bg-bg-raised text-fg font-semibold shadow-xs border border-border"
                : "text-fg-subtle hover:text-fg"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Content</span>
            <span className="text-[10px] opacity-75 font-mono ml-0.5">
              ({initialEntries.length + initialApps.length})
            </span>
          </button>

          <button
            onClick={() => handleSelectView("publish")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[4px] transition-all cursor-pointer ${
              currentView === "publish"
                ? "bg-bg-raised text-fg font-semibold shadow-xs border border-border"
                : "text-fg-subtle hover:text-fg"
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>

          <button
            onClick={() => handleSelectView("inquiries")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[4px] transition-all cursor-pointer relative ${
              currentView === "inquiries"
                ? "bg-bg-raised text-fg font-semibold shadow-xs border border-border"
                : "text-fg-subtle hover:text-fg"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Inquiries</span>
            {unreadInquiriesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-fg text-bg text-[9px] font-bold">
                {unreadInquiriesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSelectView("audit")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[4px] transition-all cursor-pointer ${
              currentView === "audit"
                ? "bg-bg-raised text-fg font-semibold shadow-xs border border-border"
                : "text-fg-subtle hover:text-fg"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit</span>
          </button>
        </nav>
      </div>

      {/* ── Active Domain Workspace ── */}
      <div className="pt-1">
        {currentView === "content" && (
          <AdminManager
            initialApps={initialApps}
            initialEntries={initialEntries}
            initialChangelog={initialChangelog}
            initialBanner={initialBanner}
          />
        )}

        {currentView === "publish" && (
          <div className="space-y-4">
            <PublishPanel />
          </div>
        )}

        {currentView === "inquiries" && (
          <div className="space-y-4">
            <InquiriesPanel />
          </div>
        )}

        {currentView === "audit" && (
          <div className="space-y-4">
            <AuditPanel />
          </div>
        )}
      </div>
    </div>
  );
}
