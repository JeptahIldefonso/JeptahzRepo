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
  Github,
  Mail,
  Sparkles,
  Pin,
} from "lucide-react";
import { getSiteSettings } from "@/db/data-provider";

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const portfolioUrl = "https://jeptahportfolio.vercel.app/";
  const githubUrl = settings.social_links?.github || "https://github.com/JeptahIldefonso";

  return (
    <div className="max-w-3xl space-y-10">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="font-display text-3xl font-medium tracking-tight text-fg">
          Portfolio & About
        </h1>
        <p className="mt-1 text-sm text-fg-muted max-w-xl">
          Personal portfolio, public developer profile, and the open repository archive.
        </p>
      </div>

      {/* Featured Pinned Portfolio Link Card (Noticeable Shining Gray) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wider text-fg font-medium flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-fg-subtle" />
            <span>Featured Developer Portfolio</span>
          </h2>
          <span className="inline-flex items-center space-x-1.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Verified Live</span>
          </span>
        </div>

        {/* Facebook-Style Link Card - Shining Gray Metallic Finish with Legit Simple Hover */}
        <a
          href={portfolioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block relative rounded-[10px] border-2 border-neutral-300 hover:border-neutral-500 bg-gradient-to-br from-neutral-100 via-white to-neutral-200/90 hover:from-neutral-200/90 hover:via-neutral-100 hover:to-neutral-300/90 p-5 sm:p-6 space-y-4 shadow-sm hover:shadow-md ring-1 ring-black/5 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer"
          aria-label="Visit Jeptah's official developer portfolio at jeptahportfolio.vercel.app"
        >
          {/* Specular Top Shine Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-neutral-300 via-white to-neutral-300 opacity-90" />

          {/* Subtle slightly darker gray hover tint */}
          <div className="absolute inset-0 bg-black/[0.035] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

          {/* Pinned Pill & Domain Header Row */}
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-neutral-200/80">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-[4px] bg-neutral-900 text-white font-mono text-[10px] font-semibold tracking-wider uppercase shadow-xs">
              <Pin className="w-3 h-3 fill-white rotate-45" />
              <span>PINNED LINK</span>
            </div>

            <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 px-2.5 py-0.5 rounded-[4px] text-xs font-mono font-medium shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Official Site</span>
            </div>
          </div>

          {/* Domain Pill */}
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[4px] bg-white border border-neutral-300 group-hover:border-neutral-400 group-hover:bg-neutral-50/80 text-neutral-800 font-mono text-xs font-semibold shadow-2xs transition-colors duration-200">
              <Globe className="w-3.5 h-3.5 text-neutral-600" />
              <span className="tracking-wide">JEPTAHPORTFOLIO.VERCEL.APP</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="relative z-10 space-y-1.5">
            <div className="font-display text-lg sm:text-xl font-semibold text-black flex items-center justify-between">
              <span>Jeptah Ashley Ildefonso — Portfolio</span>
              <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed font-sans">
              Portfolio of Jeptah Ildefonso — projects, writing, work history, and experiments.
              Explore live web builds, mobile applications, and software engineering experience.
            </p>
          </div>

          {/* Trust Footer Bar */}
          <div className="relative z-10 pt-3 border-t border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-1.5 text-neutral-600 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe external link • Verified HTTPS encryption</span>
            </div>
            <div className="font-mono text-xs text-black font-semibold inline-flex items-center space-x-1 self-start sm:self-auto bg-white border border-neutral-300 px-3 py-1 rounded-[4px] shadow-2xs group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 transition-all duration-200">
              <span>Open portfolio</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
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
