import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Eye, FileText, FileCode, Paperclip, Download } from "lucide-react";
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

      {/* Attached Files & Documents */}
      {entry.attached_files && entry.attached_files.length > 0 && (
        <section className="border-t border-border pt-6 space-y-3">
          <h3 className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
            Attached Documents &amp; Files ({entry.attached_files.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entry.attached_files.map((file) => {
              const isPdf = file.type === "pdf" || file.name.endsWith(".pdf");
              const isWord =
                file.type === "word" ||
                file.type === "doc" ||
                file.name.endsWith(".docx") ||
                file.name.endsWith(".doc");
              const isMarkdown =
                file.type === "markdown" ||
                file.name.endsWith(".md") ||
                file.name.endsWith(".markdown");
              const isCsv = file.type === "csv" || file.name.endsWith(".csv");

              return (
                <a
                  key={file.id || file.name}
                  href={file.url}
                  download={file.name}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between p-3 rounded-[6px] border border-border bg-bg-raised hover:bg-white hover:border-black/40 hover:shadow-2xs transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-[4px] flex items-center justify-center shrink-0 font-mono text-[10px] font-bold ${
                        isPdf
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : isWord
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : isMarkdown
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : isCsv
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                      }`}
                    >
                      {isPdf ? (
                        <FileText className="w-4 h-4 text-rose-600" />
                      ) : isWord ? (
                        <FileCode className="w-4 h-4 text-blue-600" />
                      ) : isMarkdown ? (
                        <FileCode className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Paperclip className="w-4 h-4 text-neutral-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-medium text-fg truncate group-hover:underline">
                        {file.name}
                      </p>
                      <p className="text-[10px] font-mono text-fg-subtle">
                        {isPdf
                          ? "PDF Document"
                          : isWord
                          ? "Word Document"
                          : isMarkdown
                          ? "Markdown Document"
                          : isCsv
                          ? "CSV Spreadsheet"
                          : "Attachment"}
                        {file.size ? ` • ${file.size}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 font-mono text-[11px] text-fg-muted group-hover:text-fg shrink-0 px-2.5 py-1 rounded-[4px] bg-bg border border-border transition-colors">
                    <Download className="w-3 h-3" />
                    <span className="hidden sm:inline">Download</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
