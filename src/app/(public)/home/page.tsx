import React from "react";
import Link from "next/link";
import { ArrowRight, Box, BookOpen, ExternalLink } from "lucide-react";
import { getApps, getEntries, getSiteSettings } from "@/db/data-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function HubOverviewPage() {
  const [apps, entries, settings] = await Promise.all([
    getApps({ featuredOnly: true }),
    getEntries(),
    getSiteSettings(),
  ]);

  const featuredApp = apps[0];
  const recentEntries = entries.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-4 sm:py-8">
      {/* Clean Welcome Header */}
      <header className="space-y-4 border-b border-border pb-8">
        <h1 className="font-editorial text-4xl sm:text-5xl font-normal tracking-tight text-fg leading-tight">
          Welcome
        </h1>
        <p className="text-sm sm:text-base text-fg-muted max-w-xl font-normal leading-relaxed">
          {settings.intro_subtext ||
            "Notes, projects, courses, and ideas — all in one place."}
        </p>
      </header>

      {/* Featured Project */}
      {featuredApp && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
              Featured Project
            </span>
            <Link
              href="/home/apps"
              className="font-sans text-xs text-fg-subtle hover:text-fg transition-colors flex items-center space-x-1"
            >
              <span>All Projects ({apps.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="border border-border bg-bg-raised p-6 sm:p-8 rounded-[4px] space-y-5 hover:border-fg/40 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="text-[10px]">
                  {featuredApp.version}
                </Badge>
                <Badge variant="subtle" className="text-[10px]">
                  {featuredApp.category}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Link href={`/home/apps/${featuredApp.slug}`}>
                <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-fg hover:underline">
                  {featuredApp.title}
                </h2>
              </Link>
              <p className="text-sm text-fg-muted leading-relaxed">
                {featuredApp.tagline}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {featuredApp.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[10px] bg-bg border border-border px-2 py-0.5 text-fg rounded-[2px]"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="border-t border-border pt-4 flex flex-wrap items-center gap-3">
              <Link href={`/home/apps/${featuredApp.slug}`}>
                <Button size="sm">
                  <span>View Project</span>
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Button>
              </Link>
              {featuredApp.repo_url && (
                <a
                  href={featuredApp.repo_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <span>GitHub</span>
                    <ExternalLink className="ml-1.5 w-3 h-3 opacity-60" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
            Recent Posts
          </span>
          <Link
            href="/home/docs"
            className="font-sans text-xs text-fg-subtle hover:text-fg transition-colors flex items-center space-x-1"
          >
            <span>All Posts</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-4">
          {recentEntries.map((entry) => (
            <div
              key={entry.id}
              className="border border-border bg-bg-raised p-5 sm:p-6 rounded-[4px] hover:border-fg/40 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between font-mono text-[10px] text-fg-subtle">
                <span className="uppercase bg-bg border border-border px-1.5 py-0.5 rounded-[2px]">
                  {entry.type}
                </span>
                <span>{formatDate(entry.created_at)}</span>
              </div>

              <div className="space-y-1.5">
                <Link
                  href={`/home/${entry.topic_slug || "docs"}/${entry.slug}`}
                >
                  <h3 className="font-editorial text-xl sm:text-2xl font-normal text-fg hover:underline leading-snug">
                    {entry.title}
                  </h3>
                </Link>
                {entry.summary && (
                  <p className="text-xs sm:text-sm text-fg-muted font-normal leading-relaxed line-clamp-2">
                    {entry.summary}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between font-mono text-xs">
                <span className="text-[10px] text-fg-subtle">
                  {entry.metadata?.read_time || ""}
                </span>
                <Link
                  href={`/home/${entry.topic_slug || "docs"}/${entry.slug}`}
                  className="text-fg hover:underline flex items-center space-x-1"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
