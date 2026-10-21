import React from "react";
import Link from "next/link";
import { ArrowRight, Settings, ExternalLink } from "lucide-react";
import { getApps, getEntries, getSiteSettings } from "@/db/data-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function HubOverviewPage() {
  const [apps, entries, settings] = await Promise.all([
    getApps(),
    getEntries(),
    getSiteSettings(),
  ]);

  const featuredApps = apps.slice(0, 3);
  const recentEntries = entries.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto space-y-20 py-4 sm:py-8">
      {/* ── Main Hero Section Matching JeptahPortfolio Screenshot ── */}
      <section className="relative space-y-6 pt-4">
        {/* Gear / Admin Icon Top Left */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="h-9 w-9 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 flex items-center justify-center text-black/70 hover:text-black transition-colors"
            title="System Settings"
          >
            <Settings className="w-4 h-4 stroke-[1.5]" />
          </Link>
        </div>

        {/* Editorial Hairline Rule */}
        <hr className="border-0 border-t border-black/80 w-full my-3" />

        {/* Main Hero Grid: Oversized Name on Left, Presence Widget on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <h1 className="font-cinzel text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-black tracking-tight leading-[0.92] uppercase select-none">
              JEPTAH ASHLEY<br />
              ILDEFONSO
            </h1>
          </div>

          {/* Right Presence Widget */}
          <div className="lg:col-span-4 flex flex-col items-start lg:items-center space-y-2 pt-2">
            <div className="relative">
              <img
                src="/admin-user.png"
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border border-black/20"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-white" />
            </div>
            <div className="font-mono text-xs uppercase tracking-wider font-semibold text-black">
              ONLINE
            </div>
            <div className="font-mono text-[11px] text-black/60">
              Just Chilling
            </div>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="font-mono text-xs text-black/70 flex flex-wrap items-center gap-2 pt-2">
          <span>QUEZON CITY (PHILIPPINES)</span>
          <span>—</span>
          <span>TEST</span>
          <span>—</span>
          <span className="flex items-center space-x-1.5 text-black">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            <span>OPEN TO OPPORTUNITIES AND CONVERSATION</span>
          </span>
        </div>

        {/* Role & Bio Text */}
        <div className="space-y-2 pt-4 max-w-2xl">
          <h2 className="font-sans text-xl font-medium text-black">
            Full-Stack dev
          </h2>
          <p className="text-sm text-black/80 leading-relaxed font-normal">
            Bio im Sophomore Computer Science student this 2026 Exploring Full-stack development junior knowledge work with AI
          </p>
        </div>

        {/* CONNECT Button Row */}
        <div className="space-y-2 pt-6">
          <div className="font-mono text-[10px] tracking-[0.2em] text-black/50 uppercase">
            CONNECT
          </div>
          <div className="flex flex-wrap gap-2 font-mono text-xs">
            <a
              href="https://github.com/JeptahIldefonso"
              target="_blank"
              rel="noreferrer"
              className="border border-black/30 bg-white/60 hover:border-black px-4 py-2 transition-colors flex items-center space-x-1.5 group"
            >
              <span>GITHUB</span>
              <span className="text-[10px] opacity-70 group-hover:opacity-100">↗</span>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="border border-black/30 bg-white/60 hover:border-black px-4 py-2 transition-colors flex items-center space-x-1.5 group"
            >
              <span>FACEBOOK</span>
              <span className="text-[10px] opacity-70 group-hover:opacity-100">↗</span>
            </a>
            <Link
              href="/home/contact"
              className="border border-black/30 bg-white/60 hover:border-black px-4 py-2 transition-colors flex items-center space-x-1.5"
            >
              <span>CONTACT NO.</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Projects Section ── */}
      <section className="space-y-6 border-t border-black/10 pt-12">
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-black/60">
            SHOWCASE &bull; PROJECTS
          </div>
          <Link
            href="/home/apps"
            className="font-mono text-xs text-black hover:underline flex items-center space-x-1"
          >
            <span>ALL PROJECTS ({apps.length})</span>
            <span>↗</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredApps.map((app) => (
            <div
              key={app.id}
              className="border border-black/15 bg-white/70 backdrop-blur-xs p-6 space-y-4 hover:border-black transition-colors"
            >
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="border border-black/20 px-1.5 py-0.5 rounded-[2px]">{app.version}</span>
                <span className="text-black/50">{app.category}</span>
              </div>

              <div className="space-y-1.5">
                <Link href={`/home/apps/${app.slug}`}>
                  <h3 className="font-cinzel text-xl font-bold text-black hover:underline">
                    {app.title}
                  </h3>
                </Link>
                <p className="text-xs text-black/70 line-clamp-2 leading-relaxed">
                  {app.tagline}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 font-mono text-[9px] pt-1">
                {app.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="border border-black/10 bg-black/5 px-1.5 py-0.5 text-black"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-black/10 flex justify-between items-center text-xs font-mono">
                <Link
                  href={`/home/apps/${app.slug}`}
                  className="text-black font-medium hover:underline flex items-center space-x-1"
                >
                  <span>VIEW BUILD</span>
                  <span>↗</span>
                </Link>
                {app.repo_url && (
                  <a
                    href={app.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-black/50 hover:text-black"
                  >
                    GITHUB
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent Archival Theory Records ── */}
      <section className="space-y-6 border-t border-black/10 pt-12">
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-black/60">
            RECENT &bull; THEORY & NOTES
          </div>
          <Link
            href="/home/docs"
            className="font-mono text-xs text-black hover:underline flex items-center space-x-1"
          >
            <span>ALL DOCS</span>
            <span>↗</span>
          </Link>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {recentEntries.map((entry) => (
            <div
              key={entry.id}
              className="border border-black/10 bg-white/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-black transition-colors"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2 text-[10px] text-black/50">
                  <span className="uppercase">{entry.type}</span>
                  <span>&bull;</span>
                  <span>{formatDate(entry.created_at)}</span>
                </div>
                <Link
                  href={`/home/${entry.topic_slug || "docs"}/${entry.slug}`}
                  className="font-medium text-black hover:underline text-sm font-sans"
                >
                  {entry.title}
                </Link>
              </div>

              <Link
                href={`/home/${entry.topic_slug || "docs"}/${entry.slug}`}
                className="text-black text-xs hover:underline shrink-0"
              >
                OPEN RECORD ↗
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
