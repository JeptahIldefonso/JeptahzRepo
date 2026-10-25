"use client";

import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ZoomIn, X, ExternalLink, Maximize2 } from "lucide-react";

interface DocContentProps {
  content: string;
  coverImageUrl?: string | null;
  coverImageCaption?: string | null;
}

interface ActiveImage {
  src: string;
  alt?: string;
}

export function DocContent({
  content,
  coverImageUrl,
  coverImageCaption,
}: DocContentProps) {
  const [activeImage, setActiveImage] = useState<ActiveImage | null>(null);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveImage(null);
      }
    },
    []
  );

  useEffect(() => {
    if (activeImage) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImage, handleKeyDown]);

  return (
    <div className="space-y-8">
      {/* Optional HD Cover Image Banner */}
      {coverImageUrl && (
        <figure className="space-y-2">
          <div
            onClick={() =>
              setActiveImage({
                src: coverImageUrl,
                alt: coverImageCaption || "Document Cover Image",
              })
            }
            className="group relative overflow-hidden rounded-[3px] border border-border bg-bg-raised cursor-zoom-in transition-all hover:border-[#041a24]"
          >
            <img
              src={coverImageUrl}
              alt={coverImageCaption || "Cover"}
              className="w-full max-h-[460px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
            {/* HD Badge Overlay */}
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-[2px] font-mono text-[10px] tracking-wider uppercase flex items-center space-x-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3 h-3" />
              <span>HD Zoom</span>
            </div>
          </div>
          {coverImageCaption && (
            <figcaption className="font-mono text-[11px] text-fg-subtle text-center">
              {coverImageCaption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Markdown Body with Interactive HD Lightbox for all images */}
      <div className="prose prose-sm sm:prose-base max-w-none text-fg-muted font-normal leading-relaxed prose-headings:font-display prose-headings:text-fg prose-headings:font-medium prose-strong:text-fg prose-code:font-mono prose-code:text-fg prose-code:bg-bg-hover prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-[2px] prose-pre:bg-bg-raised prose-pre:border prose-pre:border-border prose-pre:text-fg prose-pre:p-4">
        {content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ node, ...props }) => {
                const src = (props.src as string) || "";
                const alt = (props.alt as string) || "";

                return (
                  <figure className="my-6 space-y-2">
                    <div
                      onClick={() => setActiveImage({ src, alt })}
                      className="group relative inline-block w-full overflow-hidden rounded-[3px] border border-border bg-bg-raised cursor-zoom-in transition-all hover:border-[#041a24]"
                    >
                      <img
                        {...props}
                        src={src}
                        alt={alt}
                        loading="lazy"
                        className="w-full h-auto max-h-[640px] object-contain rounded-[2px] transition-transform duration-200 group-hover:scale-[1.008]"
                      />
                      {/* Zoom Indicator Pill */}
                      <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white px-2 py-1 rounded-[2px] font-mono text-[10px] tracking-wider flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm">
                        <ZoomIn className="w-3 h-3" />
                        <span>CLICK FOR HD VIEW</span>
                      </div>
                    </div>
                    {alt && (
                      <figcaption className="font-mono text-[11px] text-fg-subtle text-center italic">
                        {alt}
                      </figcaption>
                    )}
                  </figure>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <p>No content has been authored for this document yet.</p>
        )}
      </div>

      {/* Fullscreen HD Lightbox Modal */}
      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/92 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-150 select-none cursor-zoom-out"
        >
          {/* Top Bar with Caption & Actions */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl flex items-center justify-between text-white/80 font-mono text-xs pb-3 border-b border-white/10"
          >
            <div className="truncate pr-4 flex items-center space-x-2">
              <span className="bg-white/15 px-1.5 py-0.5 rounded-[2px] text-[10px] uppercase tracking-wider text-white">
                HD Preview
              </span>
              <span className="text-white/90 truncate font-sans text-sm">
                {activeImage.alt || "High-Definition Visual"}
              </span>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <a
                href={activeImage.src}
                target="_blank"
                rel="noreferrer"
                download
                className="p-1.5 rounded-[2px] text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Open in new tab / Full Resolution"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setActiveImage(null)}
                className="p-1.5 rounded-[2px] text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close (Esc)"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Image Viewport */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex-1 w-full max-w-6xl flex items-center justify-center py-4 cursor-default"
          >
            <img
              src={activeImage.src}
              alt={activeImage.alt || "HD View"}
              className="max-h-[82vh] max-w-full object-contain rounded-[2px] shadow-2xl transition-transform"
            />
          </div>

          {/* Bottom Footer Hint */}
          <div className="font-mono text-[10px] text-white/50 tracking-wider">
            PRESS <kbd className="bg-white/15 px-1.5 py-0.5 rounded-[2px] text-white/80">ESC</kbd> OR CLICK ANYWHERE OUTSIDE TO CLOSE
          </div>
        </div>
      )}
    </div>
  );
}
