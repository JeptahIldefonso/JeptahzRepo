import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileText,
  FileCode,
  Paperclip,
  Download,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getEntryBySlug, getEntries } from "@/db/data-provider";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PostMediaMosaic } from "@/components/docs/post-media-mosaic";
import { PostVideoPlayer } from "@/components/docs/post-video-player";
import type { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour (ISR)

export async function generateStaticParams() {
  const entries = await getEntries();
  return entries
    .filter((e) => e.type === "course" || e.topic_slug === "courses")
    .map((e) => ({ slug: e.slug }));
}

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) return { title: "Course Not Found" };

  return {
    title: entry.title,
    description:
      entry.summary ||
      entry.content?.slice(0, 160) ||
      `Explore course syllabus for ${entry.title}`,
    openGraph: {
      title: `${entry.title} | JeptahzRepo`,
      description:
        entry.summary ||
        entry.content?.slice(0, 160) ||
        `Explore course syllabus for ${entry.title}`,
      images: entry.cover_image_url ? [{ url: entry.cover_image_url }] : undefined,
    },
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  const mediaItems = entry.media_items || [];
  if (mediaItems.length === 0 && entry.cover_image_url) {
    mediaItems.push({
      id: "cover-img",
      type: "image",
      url: entry.cover_image_url,
      caption: entry.title,
    });
  }

  return (
    <article className="max-w-3xl mx-auto space-y-8 pb-16">
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
          <Badge variant="default">CS Curriculum</Badge>
          {entry.is_pinned && (
            <Badge variant="subtle" className="text-sky-700 bg-sky-50 border-sky-200">
              Pinned
            </Badge>
          )}
          {entry.metadata?.code && (
            <Badge variant="subtle">{entry.metadata.code}</Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-fg leading-tight">
            {entry.title}
          </h1>

          {entry.external_url && (
            <a
              href={entry.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-mono text-fg bg-bg-raised border border-border hover:border-fg px-3 py-1.5 rounded-[4px] shrink-0 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Official Course Portal</span>
            </a>
          )}
        </div>

        {entry.summary && (
          <p className="text-base text-fg-muted font-normal leading-relaxed">
            {entry.summary}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 font-mono text-xs text-fg-subtle border-t border-border/60">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Curriculum Date: {formatDate(entry.created_at)}</span>
          </div>

          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {entry.tags.map((tag) => (
                <span key={tag} className="text-[11px] font-mono text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                  #{tag.replace(/^#/, "")}
                </span>
              ))}
            </div>
          )}
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

      {/* Lecture Slides & Architecture Diagrams */}
      {mediaItems.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-border">
          <h3 className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
            Lecture Slides &amp; Diagrams ({mediaItems.length})
          </h3>
          <PostMediaMosaic media={mediaItems} postTitle={entry.title} />
        </div>
      )}

      {/* Video Lectures */}
      {entry.video_url && (
        <div className="space-y-3 pt-6 border-t border-border">
          <h3 className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
            Course Lecture Video
          </h3>
          <PostVideoPlayer videoUrl={entry.video_url} caption={entry.title} />
        </div>
      )}

      {/* Downloadable Course Documents (PDF, Word, Syllabi) */}
      {entry.attached_files && entry.attached_files.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-border">
          <h3 className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
            Attached Course Documents &amp; Syllabi ({entry.attached_files.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entry.attached_files.map((file) => {
              const isPdf = file.type === "pdf" || file.name.endsWith(".pdf");
              const isWord =
                file.type === "word" ||
                file.type === "doc" ||
                file.name.endsWith(".docx") ||
                file.name.endsWith(".doc");

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
                          : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                      }`}
                    >
                      {isPdf ? (
                        <FileText className="w-4 h-4 text-rose-600" />
                      ) : isWord ? (
                        <FileCode className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Paperclip className="w-4 h-4 text-neutral-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-medium text-fg truncate group-hover:underline">
                        {file.name}
                      </p>
                      <p className="text-[10px] font-mono text-fg-subtle">
                        {isPdf ? "PDF Syllabus" : isWord ? "Word Document" : "Attachment"}
                        {file.size ? ` • ${file.size}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 font-mono text-[11px] text-fg-subtle group-hover:text-fg shrink-0 px-2.5 py-1 rounded-[6px] bg-bg border border-border group-hover:bg-black group-hover:text-white transition-colors">
                    <Download className="w-3 h-3" />
                    <span className="hidden sm:inline">Download</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
