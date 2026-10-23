import React from "react";
import Link from "next/link";
import {
  Globe,
  ShieldCheck,
  ExternalLink,
  Lock,
  ArrowUpRight,
  FolderGit2,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Link2,
  Github,
  Mail,
  User,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { getSiteSettings } from "@/db/data-provider";
import { Badge } from "@/components/ui/badge";

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const portfolioUrl = "https://jeptahportfolio.vercel.app/";
  const githubUrl = settings.social_links?.github || "https://github.com/JeptahIldefonso";

  return (
    <div className="max-w-3xl space-y-10">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center space-x-2 text-fg-subtle mb-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
            Public Info // Profile & Portfolio
          </span>
        </div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-fg">
          Portfolio & About
        </h1>
        <p className="mt-1 text-sm text-fg-muted max-w-xl">
          Personal portfolio, public developer profile, and the open repository archive.
        </p>
      </div>

      {/* Featured Portfolio Link Card (Facebook-Style Rich Preview) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wider text-fg font-medium flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-fg-subtle" />
            <span>Official Developer Portfolio</span>
          </h2>
          <span className="inline-flex items-center space-x-1.5 font-mono text-[11px] text-emerald-500/90 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Verified Live</span>
          </span>
        </div>

        {/* Facebook-Style Link Card */}
        <a
          href={portfolioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block border border-border bg-bg-raised hover:border-fg/40 hover:bg-bg-hover/40 transition-all duration-200 rounded-[8px] overflow-hidden shadow-sm"
          aria-label="Visit Jeptah's official developer portfolio at jeptahportfolio.vercel.app"
        >
          {/* Visual Preview Banner */}
          <div className="relative border-b border-border bg-gradient-to-br from-bg-subtle via-bg-raised to-bg p-5 sm:p-7 overflow-hidden">
            {/* Top simulated browser viewport */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60 text-fg-subtle">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-border" />
              </div>
              <div className="flex items-center space-x-2 bg-bg px-3 py-1 rounded-[4px] border border-border/80 font-mono text-[11px] text-fg-muted">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span className="truncate max-w-[200px] sm:max-w-none">
                  https://jeptahportfolio.vercel.app
                </span>
              </div>
              <div className="hidden sm:flex items-center space-x-1 text-[10px] font-mono text-fg-subtle uppercase">
                <span>SSL</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              </div>
            </div>

            {/* Inner Brand Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs tracking-[0.2em] font-semibold text-fg">
                  JEPTAH.Z
                </span>
                <span className="font-mono text-[10px] text-fg-subtle border border-border/70 px-2 py-0.5 rounded-[2px] bg-bg/50">
                  DEVELOPER PORTFOLIO
                </span>
              </div>
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-fg group-hover:text-fg">
                  Jeptah Ashley Ildefonso
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-fg-muted">
                  Software Engineering • Full-Stack Web • Mobile & Systems Development
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Next.js", "TypeScript", "React Native", "Tailwind CSS", "Vercel"].map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] bg-bg border border-border/80 text-fg-subtle px-2 py-0.5 rounded-[2px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Facebook OpenGraph Link Details Box */}
          <div className="p-4 sm:p-5 space-y-3 bg-bg-raised/70">
            {/* Domain & Trust Row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Globe className="w-3.5 h-3.5 text-fg-subtle" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-fg-subtle font-medium">
                  JEPTAHPORTFOLIO.VERCEL.APP
                </span>
              </div>
              <div className="inline-flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-[3px] text-[10px] font-mono">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Official Site</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <div className="font-display text-base sm:text-lg font-medium text-fg flex items-center justify-between">
                <span>Jeptah Ashley Ildefonso — Portfolio</span>
                <ArrowUpRight className="w-4 h-4 text-fg-subtle group-hover:text-fg group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
                Portfolio of Jeptah Ildefonso — projects, writing, work history, and experiments.
                Explore live web builds, mobile applications, and software engineering experience.
              </p>
            </div>

            {/* Trust Footer Bar */}
            <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center space-x-1.5 text-fg-subtle font-mono">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>Safe external link • Verified HTTPS encryption</span>
              </div>
              <div className="font-mono text-xs text-fg font-medium group-hover:underline inline-flex items-center space-x-1 self-start sm:self-auto">
                <span>Open portfolio</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </div>
            </div>
          </div>
        </a>

        <p className="text-[11px] text-fg-subtle font-mono px-1">
          ✓ Official personal portfolio hosted on Vercel. Direct link with SSL security verification.
        </p>
      </section>

      {/* About Jeptah & JeptahzRepo */}
      <section className="border-t border-border pt-8 space-y-6">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wider text-fg font-medium mb-3">
            About Jeptah & The Repository
          </h2>
          <p className="text-sm text-fg-muted leading-relaxed">
            Hey, I'm <strong className="text-fg font-medium">Jeptah Ashley Ildefonso</strong> — a Computer Science student and software developer.
            I build practical applications, study system architecture, and document everything I learn along the way.
          </p>
          <p className="mt-3 text-sm text-fg-muted leading-relaxed">
            <strong className="text-fg font-medium">JeptahzRepo</strong> is my open intellectual vault and personal knowledge repository.
            While my main portfolio showcases featured applications, this archive serves as the in-depth companion where all notes,
            source repositories, course materials, and technical dev logs are organized for public access.
          </p>
        </div>

        {/* Repository Contents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="border border-border bg-bg-raised p-4 rounded-[4px] space-y-1.5">
            <div className="flex items-center space-x-2 text-fg font-medium text-xs font-mono">
              <FolderGit2 className="w-4 h-4 text-fg-subtle" />
              <span>Projects & Showcases</span>
            </div>
            <p className="text-xs text-fg-muted leading-relaxed">
              Software builds, desktop tools, and web applications with source repositories and screenshots.
            </p>
          </div>

          <div className="border border-border bg-bg-raised p-4 rounded-[4px] space-y-1.5">
            <div className="flex items-center space-x-2 text-fg font-medium text-xs font-mono">
              <BookOpen className="w-4 h-4 text-fg-subtle" />
              <span>Notes & Docs</span>
            </div>
            <p className="text-xs text-fg-muted leading-relaxed">
              Technical guides, algorithm breakdowns, systems architecture, and web development documentation.
            </p>
          </div>

          <div className="border border-border bg-bg-raised p-4 rounded-[4px] space-y-1.5">
            <div className="flex items-center space-x-2 text-fg font-medium text-xs font-mono">
              <GraduationCap className="w-4 h-4 text-fg-subtle" />
              <span>Course Archives</span>
            </div>
            <p className="text-xs text-fg-muted leading-relaxed">
              Structured course notes, lecture summaries, and academic roadmaps from computer science subjects.
            </p>
          </div>

          <div className="border border-border bg-bg-raised p-4 rounded-[4px] space-y-1.5">
            <div className="flex items-center space-x-2 text-fg font-medium text-xs font-mono">
              <Lightbulb className="w-4 h-4 text-fg-subtle" />
              <span>Ideas & Dev Logs</span>
            </div>
            <p className="text-xs text-fg-muted leading-relaxed">
              Technical musings, system designs, architectural thoughts, and development journals.
            </p>
          </div>
        </div>
      </section>

      {/* Public Verified Channels */}
      <section className="border-t border-border pt-8 space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-fg font-medium">
          Public Channels & Verified Profiles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border bg-bg-raised p-4 rounded-[4px] hover:border-fg/40 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <Globe className="w-4 h-4 text-fg-subtle group-hover:text-fg transition-colors" />
              <div>
                <div className="font-mono text-xs text-fg font-medium">Official Portfolio</div>
                <div className="text-[11px] text-fg-muted font-mono truncate max-w-[190px]">
                  jeptahportfolio.vercel.app
                </div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-fg-subtle group-hover:text-fg transition-colors" />
          </a>

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border bg-bg-raised p-4 rounded-[4px] hover:border-fg/40 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <Github className="w-4 h-4 text-fg-subtle group-hover:text-fg transition-colors" />
              <div>
                <div className="font-mono text-xs text-fg font-medium">GitHub Profile</div>
                <div className="text-[11px] text-fg-muted font-mono truncate max-w-[190px]">
                  github.com/JeptahIldefonso
                </div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-fg-subtle group-hover:text-fg transition-colors" />
          </a>
        </div>

        <div className="pt-2">
          <Link
            href="/home/contact"
            className="inline-flex items-center space-x-2 text-xs font-mono text-fg-muted hover:text-fg transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Looking to get in touch? Visit the Contact page →</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
