import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, BookOpen, Layers } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getEntryBySlug } from "@/db/data-provider";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      {/* Return Link */}
      <Link
        href="/home/courses"
        className="inline-flex items-center space-x-1.5 font-mono text-xs text-fg-subtle hover:text-fg transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Curricula</span>
      </Link>

      {/* Course Header */}
      <header className="border-b border-border pb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {entry.metadata?.code && (
            <Badge variant="default">{entry.metadata.code}</Badge>
          )}
          {entry.metadata?.semester && (
            <Badge variant="subtle">{entry.metadata.semester}</Badge>
          )}
          {entry.metadata?.credits && (
            <span className="font-mono text-xs text-fg-subtle">
              {entry.metadata.credits} Credits
            </span>
          )}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-fg leading-tight">
          {entry.title}
        </h1>

        {entry.summary && (
          <p className="text-base text-fg-muted font-normal leading-relaxed">
            {entry.summary}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs text-fg-subtle border-t border-border/60">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Updated: {formatDate(entry.created_at)}</span>
          </div>
        </div>
      </header>

      {/* Course Content / Syllabus Markdown */}
      <div className="prose prose-sm sm:prose-base max-w-none text-fg-muted font-normal leading-relaxed prose-headings:font-display prose-headings:text-fg prose-headings:font-medium prose-strong:text-fg prose-code:font-mono prose-code:text-fg prose-code:bg-bg-hover prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-[2px] prose-pre:bg-bg-raised prose-pre:border prose-pre:border-border prose-pre:text-fg prose-pre:p-4">
        {entry.content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {entry.content}
          </ReactMarkdown>
        ) : (
          <p>No syllabus content available for this curriculum.</p>
        )}
      </div>
    </article>
  );
}
