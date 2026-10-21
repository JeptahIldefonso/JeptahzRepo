import React from "react";
import Link from "next/link";
import { ArrowRight, Box, BookOpen, GraduationCap, Code2, Download, ExternalLink } from "lucide-react";
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
  const recentEntries = entries.slice(0, 4);

  return (
    <div className="space-y-12">
      {/* Editorial Header */}
      <div className="border-b border-border pb-8">
        <div className="flex items-center space-x-2 text-fg-subtle mb-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
            Command Center // Central Feed
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-fg">
          Computer Science Archive & Engineering Hub
        </h1>
        <p className="mt-2 text-sm text-fg-muted max-w-2xl leading-relaxed">
          {settings.intro_subtext ||
            "An open repository of computer science theory, production application showcases, course curricula, and engineering ideas."}
        </p>
      </div>

      {/* Featured Application Showcase Banner (Feature 3 Preview) */}
      {featuredApp && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-fg-subtle flex items-center space-x-2">
              <Box className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Featured Software Showcase</span>
            </h2>
            <Link
              href="/home/apps"
              className="font-mono text-xs text-fg hover:underline flex items-center space-x-1"
            >
              <span>View All Apps ({apps.length})</span>
              <ArrowRight className="w-3 h-3 stroke-[1.5]" />
            </Link>
          </div>

          <div className="border border-border bg-bg-raised p-6 sm:p-8 rounded-[2px] transition-all hover:border-fg/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center space-x-2.5">
                  <Badge variant="default">{featuredApp.version}</Badge>
                  <Badge variant="subtle">{featuredApp.category}</Badge>
                  <span className="font-mono text-[11px] text-fg-subtle">
                    Status: {featuredApp.badge}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-medium text-fg">
                  {featuredApp.title}
                </h3>
                <p className="text-sm text-fg-muted leading-relaxed">
                  {featuredApp.tagline}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {featuredApp.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-[10px] bg-bg border border-border px-2 py-0.5 text-fg-subtle rounded-[2px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 sm:items-center lg:items-end">
                <Link href={`/home/apps/${featuredApp.slug}`}>
                  <Button size="md" className="w-full sm:w-auto">
                    <span>Inspect App & Carousel</span>
                    <ArrowRight className="ml-2 w-3.5 h-3.5" />
                  </Button>
                </Link>
                {featuredApp.repo_url && (
                  <a
                    href={featuredApp.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button variant="outline" size="md" className="w-full sm:w-auto">
                      <ExternalLink className="mr-2 w-3.5 h-3.5" />
                      <span>GitHub Repo</span>
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Theory & Knowledge Entries */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-fg-subtle flex items-center space-x-2">
            <BookOpen className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Recent Academic Notes & Curricula</span>
          </h2>
          <Link
            href="/home/docs"
            className="font-mono text-xs text-fg hover:underline flex items-center space-x-1"
          >
            <span>All Documents</span>
            <ArrowRight className="w-3 h-3 stroke-[1.5]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentEntries.map((entry) => (
            <Link
              key={entry.id}
              href={`/home/${entry.topic_slug || "docs"}/${entry.slug}`}
              className="group border border-border bg-bg-raised p-6 rounded-[2px] transition-all hover:border-fg/40 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="subtle">{entry.type}</Badge>
                  <span className="font-mono text-[10px] text-fg-subtle">
                    {formatDate(entry.created_at)}
                  </span>
                </div>
                <h4 className="font-display text-lg font-medium text-fg group-hover:underline">
                  {entry.title}
                </h4>
                <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed">
                  {entry.summary}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-3">
                <span className="font-mono text-[10px] text-fg-subtle">
                  {entry.metadata?.read_time || "4 min read"}
                </span>
                <span className="font-mono text-[11px] text-fg group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                  <span>Read Article</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Navigation Vault Pillars */}
      <section className="border-t border-border pt-8">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-fg-subtle mb-4">
          Repository Directories
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/home/courses"
            className="border border-border bg-bg-raised p-4 rounded-[2px] hover:border-fg/40 transition-colors"
          >
            <GraduationCap className="w-5 h-5 stroke-[1.5] text-fg mb-2" />
            <div className="font-mono text-xs font-medium text-fg">Courses & Syllabi</div>
            <div className="text-[11px] text-fg-muted mt-1">Study roadmaps & lecture archives</div>
          </Link>
          <Link
            href="/home/projects"
            className="border border-border bg-bg-raised p-4 rounded-[2px] hover:border-fg/40 transition-colors"
          >
            <Code2 className="w-5 h-5 stroke-[1.5] text-fg mb-2" />
            <div className="font-mono text-xs font-medium text-fg">Code Repositories</div>
            <div className="text-[11px] text-fg-muted mt-1">Assignments, lab code & prototypes</div>
          </Link>
          <Link
            href="/home/ideas"
            className="border border-border bg-bg-raised p-4 rounded-[2px] hover:border-fg/40 transition-colors"
          >
            <Box className="w-5 h-5 stroke-[1.5] text-fg mb-2" />
            <div className="font-mono text-xs font-medium text-fg">Raw Ideas & Devlogs</div>
            <div className="text-[11px] text-fg-muted mt-1">Brainstorming logs & drafts</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
