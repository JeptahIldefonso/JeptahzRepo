import React from "react";
import Link from "next/link";
import { ArrowRight, Box, BookOpen, GraduationCap, Code2, ExternalLink } from "lucide-react";
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
  const allEntries = entries;

  return (
    <div className="space-y-10">
      {/* Broadsheet Masthead Header */}
      <header className="border-b-2 border-fg pb-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="font-editorial text-4xl sm:text-5xl font-normal tracking-tight text-fg">
            Repository Dispatch
          </h1>
          <span className="font-mono text-xs text-fg-subtle">
            Published from the Computer Science Vault
          </span>
        </div>
        <p className="text-sm text-fg-muted max-w-2xl leading-relaxed">
          {settings.intro_subtext ||
            "An open repository of computer science theory, production application showcases, course curricula, and engineering ideas."}
        </p>
      </header>

      {/* Asymmetric Two-Column Broadsheet Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Primary Column: Lead Story & Featured Software (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Featured Lead App */}
          {featuredApp && (
            <section className="space-y-4 border-b border-border pb-8">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
                  Lead Software Showcase &bull; {featuredApp.category}
                </span>
                <span className="font-mono text-xs text-fg">{featuredApp.version}</span>
              </div>

              <div className="space-y-3">
                <Link href={`/home/apps/${featuredApp.slug}`}>
                  <h2 className="font-editorial text-3xl font-normal text-fg hover:underline">
                    {featuredApp.title}
                  </h2>
                </Link>

                <p className="text-sm text-fg-muted leading-relaxed">
                  {featuredApp.tagline}
                </p>

                {/* Screenshot Frame */}
                {featuredApp.carousel_images[0] && (
                  <div className="aspect-video w-full overflow-hidden border border-border bg-bg-raised mt-3">
                    <img
                      src={featuredApp.carousel_images[0].url}
                      alt={featuredApp.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {featuredApp.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-[10px] bg-bg-raised border border-border px-2 py-0.5 text-fg rounded-[2px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="pt-3 flex items-center space-x-3">
                  <Link href={`/home/apps/${featuredApp.slug}`}>
                    <Button size="sm">Inspect Build Details</Button>
                  </Link>
                  {featuredApp.repo_url && (
                    <a href={featuredApp.repo_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <span>GitHub Source</span>
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Lead Academic Article Breakdown */}
          {allEntries[0] && (
            <article className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
                  Featured Theory Paper
                </span>
                <span className="font-mono text-[10px] text-fg-subtle">
                  {formatDate(allEntries[0].created_at)}
                </span>
              </div>

              <Link href={`/home/${allEntries[0].topic_slug || "docs"}/${allEntries[0].slug}`}>
                <h3 className="font-editorial text-2xl font-normal text-fg hover:underline">
                  {allEntries[0].title}
                </h3>
              </Link>

              <p className="text-sm text-fg-muted leading-relaxed">
                {allEntries[0].summary}
              </p>

              <div className="pt-1">
                <Link
                  href={`/home/${allEntries[0].topic_slug || "docs"}/${allEntries[0].slug}`}
                  className="font-sans text-xs text-fg hover:underline font-medium"
                >
                  Read full breakdown &rarr;
                </Link>
              </div>
            </article>
          )}
        </div>

        {/* Right High-Density Index Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:border-l border-border lg:pl-8">
          <div className="flex items-center justify-between border-b-2 border-fg pb-2">
            <h2 className="font-mono text-xs uppercase tracking-wider text-fg font-medium">
              Repository Index
            </h2>
            <span className="font-mono text-[10px] text-fg-subtle">
              {allEntries.length} Records
            </span>
          </div>

          {/* High-Density Tabular Line Items */}
          <div className="divide-y divide-border">
            {allEntries.slice(0, 7).map((entry) => (
              <div key={entry.id} className="py-3 space-y-1 group">
                <div className="flex items-center justify-between text-[10px] font-mono text-fg-subtle">
                  <span className="uppercase">{entry.type}</span>
                  <span>{formatDate(entry.created_at)}</span>
                </div>
                <Link
                  href={`/home/${entry.topic_slug || "docs"}/${entry.slug}`}
                  className="block font-sans text-xs font-medium text-fg group-hover:underline leading-snug"
                >
                  {entry.title}
                </Link>
              </div>
            ))}
          </div>

          {/* Quick Pillar Jump Bar */}
          <div className="border-t border-border pt-6 space-y-3 font-mono text-xs">
            <div className="text-[10px] uppercase tracking-wider text-fg-subtle">
              Direct Topic Indices
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/home/docs"
                className="border border-border p-2.5 bg-bg-raised hover:border-fg transition-colors block text-center"
              >
                Docs & Theory
              </Link>
              <Link
                href="/home/courses"
                className="border border-border p-2.5 bg-bg-raised hover:border-fg transition-colors block text-center"
              >
                Curricula & Syllabi
              </Link>
              <Link
                href="/home/projects"
                className="border border-border p-2.5 bg-bg-raised hover:border-fg transition-colors block text-center"
              >
                Code Repositories
              </Link>
              <Link
                href="/home/ideas"
                className="border border-border p-2.5 bg-bg-raised hover:border-fg transition-colors block text-center"
              >
                Raw Idea Vault
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
