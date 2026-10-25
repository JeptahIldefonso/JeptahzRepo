import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Code2, ExternalLink, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getEntryBySlug, getEntries } from "@/db/data-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatBytes } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour (ISR)

export async function generateStaticParams() {
  const entries = await getEntries();
  return entries
    .filter((e) => e.topic_slug === "projects")
    .map((e) => ({ slug: e.slug }));
}

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) return { title: "Project Not Found" };

  return {
    title: entry.title,
    description:
      entry.summary ||
      entry.content?.slice(0, 160) ||
      `Explore ${entry.title} codebase on JeptahzRepo`,
    openGraph: {
      title: `${entry.title} | JeptahzRepo`,
      description:
        entry.summary ||
        entry.content?.slice(0, 160) ||
        `Explore ${entry.title} codebase on JeptahzRepo`,
      images: entry.cover_image_url ? [{ url: entry.cover_image_url }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      {/* Return Link */}
      <Link
        href="/home/projects"
        className="inline-flex items-center space-x-1.5 font-mono text-xs text-fg-subtle hover:text-fg transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Code Repositories</span>
      </Link>

      {/* Header */}
      <header className="border-b border-border pb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">Repository</Badge>
          {entry.tags?.map((tag) => (
            <Badge key={tag} variant="subtle">
              #{tag}
            </Badge>
          ))}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-fg leading-tight">
          {entry.title}
        </h1>

        {entry.summary && (
          <p className="text-base text-fg-muted font-normal leading-relaxed">
            {entry.summary}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {entry.external_url && (
            <a href={entry.external_url} target="_blank" rel="noreferrer">
              <Button size="sm">
                <Code2 className="mr-1.5 h-3.5 w-3.5" />
                <span>View GitHub Repo</span>
                <ExternalLink className="ml-1.5 h-3 w-3 opacity-60" />
              </Button>
            </a>
          )}
          {entry.file_url && (
            <a href={entry.file_url} download>
              <Button variant="outline" size="sm">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                <span>Download Release ({formatBytes(entry.file_size || 0)})</span>
              </Button>
            </a>
          )}
        </div>
      </header>

      {/* Body Markdown */}
      <div className="prose prose-sm sm:prose-base max-w-none text-fg-muted font-normal leading-relaxed prose-headings:font-display prose-headings:text-fg prose-headings:font-medium prose-strong:text-fg prose-code:font-mono prose-code:text-fg prose-code:bg-bg-hover prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-[2px] prose-pre:bg-bg-raised prose-pre:border prose-pre:border-border prose-pre:text-fg prose-pre:p-4">
        {entry.content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {entry.content}
          </ReactMarkdown>
        ) : (
          <p>No README content provided for this project.</p>
        )}
      </div>
    </article>
  );
}
