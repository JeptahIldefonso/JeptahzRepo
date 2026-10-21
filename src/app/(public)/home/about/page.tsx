import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Terminal, Award, BookOpen } from "lucide-react";
import { getSiteSettings } from "@/db/data-provider";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center space-x-2 text-fg-subtle mb-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
            Archival Info // Biography & Manifesto
          </span>
        </div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-fg">
          About JeptahzRepo
        </h1>
        <p className="mt-1 text-sm text-fg-muted max-w-xl">
          The engineering ethos, academic trajectory, and technical philosophy behind this archive.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="prose prose-sm sm:prose-base max-w-none text-fg-muted font-normal leading-relaxed prose-headings:font-display prose-headings:text-fg prose-headings:font-medium prose-strong:text-fg prose-code:font-mono prose-code:text-fg prose-code:bg-bg-hover prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-[2px] prose-pre:bg-bg-raised prose-pre:border prose-pre:border-border prose-pre:text-fg prose-pre:p-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {settings.about_markdown ||
            "JeptahzRepo is a dedicated digital vault engineered for computer science students and software architects."}
        </ReactMarkdown>
      </div>

      {/* Principles Grid */}
      <div className="border-t border-border pt-8 space-y-4">
        <h3 className="font-mono text-xs uppercase tracking-wider text-fg font-medium">
          Engineering Directives
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-border bg-bg-raised p-4 rounded-[2px] space-y-1.5">
            <div className="font-mono text-xs font-medium text-fg">01 // Anti-Slop Discipline</div>
            <p className="text-xs text-fg-muted leading-relaxed">
              No generic purple gradients, bubbly rounded pills, or meaningless animations. Form follows function.
            </p>
          </div>
          <div className="border border-border bg-bg-raised p-4 rounded-[2px] space-y-1.5">
            <div className="font-mono text-xs font-medium text-fg">02 // Open Verification</div>
            <p className="text-xs text-fg-muted leading-relaxed">
              Every software build is accompanied by repository source code, release hashes, and verified installation procedures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
