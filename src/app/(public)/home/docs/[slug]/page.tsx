import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Eye, Share2 } from "lucide-react";
import { getEntryBySlug, getEntries } from "@/db/data-provider";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DocContent } from "@/components/docs/doc-content";
import type { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour (ISR)

export async function generateStaticParams() {
  const entries = await getEntries();
  return entries
    .filter((e) => e.topic_slug === "docs" || !e.topic_slug)
    .map((e) => ({ slug: e.slug }));
}

interface DocDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DocDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) return { title: "Document Not Found" };

  return {
    title: entry.title,
    description:
      entry.summary ||
      entry.content?.slice(0, 160) ||
      `Read ${entry.title} on JeptahzRepo`,
    openGraph: {
      title: `${entry.title} | JeptahzRepo`,
      description:
        entry.summary ||
        entry.content?.slice(0, 160) ||
        `Read ${entry.title} on JeptahzRepo`,
      images: entry.cover_image_url ? [{ url: entry.cover_image_url }] : undefined,
    },
  };
}

export default async function DocDetailPage({ params }: DocDetailPageProps) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      {/* Return Link */}
      <Link
        href="/home/docs"
        className="inline-flex items-center space-x-1.5 font-mono text-xs text-fg-subtle hover:text-fg transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Notes & Docs</span>
      </Link>

      {/* Article Header */}
      <header className="border-b border-border pb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="uppercase">
            {entry.type}
          </Badge>
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

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs text-fg-subtle border-t border-border/60">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(entry.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{entry.metadata?.read_time || "5 min read"}</span>
          </div>
          {entry.view_count !== undefined && (
            <div className="flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>{entry.view_count} Views</span>
            </div>
          )}
        </div>
      </header>

      {/* Article Body with HD Lightbox & Cover Banner */}
      <DocContent
        content={entry.content || ""}
        coverImageUrl={entry.cover_image_url}
        coverImageCaption={entry.metadata?.cover_caption}
      />
    </article>
  );
}
