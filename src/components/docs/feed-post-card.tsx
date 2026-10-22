"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Pin,
  CheckCircle2,
  Share2,
  Check,
  ArrowUpRight,
  Clock,
  FileText,
  FileCode,
  Paperclip,
  Download,
} from "lucide-react";
import { EntryType } from "@/db/data-provider";
import { PostMediaMosaic } from "@/components/docs/post-media-mosaic";
import { PostVideoPlayer } from "@/components/docs/post-video-player";
import { formatDate } from "@/lib/utils";

interface FeedPostCardProps {
  entry: EntryType;
  onTagClick?: (tag: string) => void;
  activeTag?: string | null;
}

export function FeedPostCard({ entry, onTagClick, activeTag }: FeedPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load "mark as read" state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`post_read_${entry.id}`);
      if (stored === "true") {
        setIsRead(true);
      }
    } catch {}
  }, [entry.id]);

  function toggleRead() {
    const next = !isRead;
    setIsRead(next);
    try {
      localStorage.setItem(`post_read_${entry.id}`, String(next));
    } catch {}
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/home/docs/${entry.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  // Determine media items
  const mediaItems = entry.media_items || [];
  if (mediaItems.length === 0 && entry.cover_image_url) {
    mediaItems.push({
      id: "cover-img",
      type: "image",
      url: entry.cover_image_url,
      caption: entry.title,
    });
  }

  const rawContent = entry.content || entry.summary || "";
  const isLong = rawContent.length > 340;
  const displayContent =
    isLong && !isExpanded ? `${rawContent.slice(0, 340)}...` : rawContent;

  return (
    <article
      id={entry.slug}
      className={`relative w-full rounded-[4px] border bg-white/85 backdrop-blur-xs transition-all shadow-xs overflow-hidden ${
        entry.is_pinned
          ? "border-sky-300/80 bg-sky-50/20 ring-1 ring-sky-300/40 shadow-sky-500/5"
          : "border-black/10 hover:border-black/25"
      }`}
    >
      <div className="p-5 sm:p-7 space-y-4">
        {/* ── Post Header: Author Avatar, Handle, Date, and Noticeable Light Blue Pin Icon ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            {/* Author Avatar */}
            <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-sm select-none shadow-xs shrink-0 ring-2 ring-black/5">
              JI
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-sans font-bold text-sm text-black hover:underline cursor-pointer">
                  Jeptah Ildefonso
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-[2px] bg-neutral-800 text-white font-medium">
                  Author
                </span>
              </div>
              <div className="flex items-center space-x-2 font-mono text-[11px] text-black/50">
                <span>@jeptah</span>
                <span>&bull;</span>
                <time dateTime={entry.created_at}>{formatDate(entry.created_at)}</time>
              </div>
            </div>
          </div>

          {/* Noticeable Light Blue Pin Icon (No text, pure icon) */}
          {entry.is_pinned && (
            <div
              title="Pinned Post"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 text-sky-600 border border-sky-300/80 shadow-xs shrink-0"
            >
              <Pin className="w-4 h-4 fill-current rotate-45" />
            </div>
          )}
        </div>

        {/* ── Post Headline / Title ── */}
        <div>
          <Link href={`/home/docs/${entry.slug}`}>
            <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-black hover:underline leading-snug">
              {entry.title}
            </h2>
          </Link>
        </div>

        {/* ── Post Markdown Content with 'See More' inline toggle ── */}
        <div className="space-y-2">
          <div className="prose prose-sm max-w-none text-black/80 font-normal leading-relaxed prose-headings:font-sans prose-headings:font-bold prose-headings:text-black prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-black prose-code:font-mono prose-code:text-black prose-code:bg-black/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-[2px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent}
            </ReactMarkdown>
          </div>

          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="font-mono text-xs font-semibold text-neutral-800 hover:text-black hover:underline pt-0.5 cursor-pointer block"
            >
              {isExpanded ? "Show Less ↑" : "See More... ↓"}
            </button>
          )}
        </div>

        {/* ── Media Gallery: Multi-Photo Mosaic (Full HD, Drag & Download) ── */}
        {mediaItems.length > 0 && (
          <div className="pt-1">
            <PostMediaMosaic media={mediaItems} postTitle={entry.title} />
          </div>
        )}

        {/* ── Video Player (≤ 25MB Limit, Native & YouTube) ── */}
        {entry.video_url && (
          <div className="pt-1">
            <PostVideoPlayer videoUrl={entry.video_url} caption={entry.title} />
          </div>
        )}

        {/* ── Attached Documents (PDF, Word, etc. Click to Download) ── */}
        {entry.attached_files && entry.attached_files.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-black/5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-black/50">
              Attached Documents ({entry.attached_files.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                    className="group flex items-center justify-between p-2.5 rounded-[3px] border border-black/15 bg-black/[0.02] hover:bg-white hover:border-black/40 hover:shadow-2xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div
                        className={`w-8 h-8 rounded-[2px] flex items-center justify-center shrink-0 font-mono text-[10px] font-bold ${
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
                        <p className="text-xs font-mono font-medium text-black truncate group-hover:underline">
                          {file.name}
                        </p>
                        <p className="text-[10px] font-mono text-black/50">
                          {isPdf ? "PDF Document" : isWord ? "Word Document" : "Attachment"}
                          {file.size ? ` • ${file.size}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 font-mono text-[11px] text-black/60 group-hover:text-black shrink-0 px-2 py-1 rounded bg-black/5 group-hover:bg-black group-hover:text-white transition-colors">
                      <Download className="w-3 h-3" />
                      <span className="hidden sm:inline">Download</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Unboxed Natural Social Hashtags ── */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
            {entry.tags.map((tag) => {
              const cleanTag = tag.replace(/^#/, "");
              const isSelected = activeTag === cleanTag;
              return (
                <button
                  key={cleanTag}
                  onClick={() => onTagClick?.(cleanTag)}
                  className={`transition-colors cursor-pointer font-medium ${
                    isSelected
                      ? "text-neutral-900 font-bold underline"
                      : "text-black/60 hover:text-neutral-900 hover:underline"
                  }`}
                >
                  #{cleanTag}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Social Action & Utility Footer ── */}
        <div className="border-t border-black/10 pt-3 flex items-center justify-between font-mono text-xs text-black/60">
          <div className="flex items-center space-x-3">
            {/* Mark as Read Button (Replaced Heart React) */}
            <button
              onClick={toggleRead}
              className={`flex items-center space-x-1.5 py-1 px-2.5 rounded-[2px] border transition-all cursor-pointer font-mono text-xs ${
                isRead
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-medium"
                  : "bg-white/60 border-black/15 text-black/60 hover:text-black hover:border-black/30"
              }`}
              title={isRead ? "Mark as unread" : "Mark as read"}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  isRead ? "text-emerald-600 fill-emerald-100" : "stroke-[1.75]"
                }`}
              />
              <span>{isRead ? "Read" : "Mark as read"}</span>
            </button>

            {/* Share / Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1.5 py-1 px-2 rounded-[2px] hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
              title="Copy direct link to post"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Reading Time */}
            {entry.metadata?.read_time && (
              <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] text-black/40">
                <Clock className="w-3 h-3" />
                <span>{entry.metadata.read_time}</span>
              </span>
            )}

            {/* Full Document Link */}
            <Link
              href={`/home/docs/${entry.slug}`}
              className="inline-flex items-center space-x-1 text-black hover:underline font-semibold"
            >
              <span>Full Doc</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
