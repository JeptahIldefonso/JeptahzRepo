"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Pin,
  Heart,
  Share2,
  Check,
  ArrowUpRight,
  Clock,
  Sparkles,
  BookOpen,
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
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(entry.likes_count || 12);
  const [copied, setCopied] = useState(false);

  // Load liked state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`post_liked_${entry.id}`);
      if (stored === "true") {
        setLiked(true);
      }
    } catch {}
  }, [entry.id]);

  function toggleLike() {
    const next = !liked;
    setLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
    try {
      localStorage.setItem(`post_liked_${entry.id}`, String(next));
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
  const isLong = rawContent.length > 320;
  const displayContent =
    isLong && !isExpanded ? `${rawContent.slice(0, 320)}...` : rawContent;

  return (
    <article
      id={entry.slug}
      className={`relative w-full rounded-[4px] border bg-white/80 backdrop-blur-xs transition-all shadow-xs overflow-hidden ${
        entry.is_pinned
          ? "border-amber-400/60 ring-1 ring-amber-400/30 shadow-amber-500/5"
          : "border-black/10 hover:border-black/25"
      }`}
    >
      {/* ── Noticeable Pin Accent Header when pinned ── */}
      {entry.is_pinned && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-amber-900 font-mono text-[11px]">
          <div className="flex items-center space-x-1.5 font-semibold">
            {/* Highly Noticeable Graphic Pin Icon */}
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white shadow-xs">
              <Pin className="w-3 h-3 fill-current rotate-45" />
            </span>
            <span className="tracking-wider uppercase text-[10px]">
              Pinned Announcement & Priority Note
            </span>
          </div>
          <span className="text-[10px] text-amber-800/70">Featured Post</span>
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-4">
        {/* ── Post Header: Author Avatar, Handle, Date, Pin ── */}
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

          {/* Fallback pin icon if pinned without banner */}
          {entry.is_pinned && (
            <div
              title="Pinned by author"
              className="p-1.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300 shadow-xs"
            >
              <Pin className="w-3.5 h-3.5 fill-current rotate-45" />
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
          <div className="flex items-center space-x-4">
            {/* Like Heart Button */}
            <button
              onClick={toggleLike}
              className={`flex items-center space-x-1.5 py-1 px-2 rounded-[2px] transition-colors cursor-pointer ${
                liked
                  ? "text-rose-600 bg-rose-50 font-medium"
                  : "hover:text-black hover:bg-black/5"
              }`}
              title="Like this post"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  liked ? "fill-current text-rose-600" : "stroke-[1.75]"
                }`}
              />
              <span>{likesCount}</span>
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
