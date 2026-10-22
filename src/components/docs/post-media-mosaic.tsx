"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Download, ZoomIn, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { EntryMediaItem } from "@/db/data-provider";

interface PostMediaMosaicProps {
  media: EntryMediaItem[];
  postTitle: string;
}

export function PostMediaMosaic({ media, postTitle }: PostMediaMosaicProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const images = media.filter((m) => m.type === "image");
  const count = images.length;

  // Handle ESC and Arrow keys in fullscreen Lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (activeIdx === null) return;
      if (e.key === "Escape") {
        setActiveIdx(null);
      } else if (e.key === "ArrowLeft") {
        setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : count - 1));
      } else if (e.key === "ArrowRight") {
        setActiveIdx((prev) => (prev !== null && prev < count - 1 ? prev + 1 : 0));
      }
    },
    [activeIdx, count]
  );

  useEffect(() => {
    if (activeIdx !== null) {
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
  }, [activeIdx, handleKeyDown]);

  if (count === 0) return null;

  // Trigger lossless HD direct download
  async function downloadImage(url: string, index: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const cleanTitle = postTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);
      link.download = `${cleanTitle}-hd-photo-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab for direct browser save
      window.open(url, "_blank");
    }
  }

  const activeImage = activeIdx !== null ? images[activeIdx] : null;

  return (
    <div className="w-full select-none">
      {/* ── 1 Image: Full Width ── */}
      {count === 1 && (
        <div
          onClick={() => setActiveIdx(0)}
          className="group relative overflow-hidden rounded-[3px] border border-black/10 bg-black/[0.02] cursor-zoom-in"
        >
          <img
            src={images[0].url}
            alt={images[0].caption || postTitle}
            draggable="true"
            className="w-full max-h-[480px] object-cover transition-transform duration-300 group-hover:scale-[1.008]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />

          {/* Action Overlay */}
          <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => downloadImage(images[0].url, 0, e)}
              title="Download HD Photo (Full Resolution)"
              className="p-1.5 bg-neutral-900/85 hover:bg-black text-white rounded-[2px] backdrop-blur-xs text-xs font-mono flex items-center space-x-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[1.75]" />
              <span className="text-[10px]">HD</span>
            </button>
            <div className="p-1.5 bg-neutral-900/85 text-white rounded-[2px] backdrop-blur-xs">
              <ZoomIn className="w-3.5 h-3.5 stroke-[1.75]" />
            </div>
          </div>

          {images[0].caption && (
            <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/75 to-transparent p-2.5 text-white font-mono text-[11px] truncate">
              {images[0].caption}
            </div>
          )}
        </div>
      )}

      {/* ── 2 Images: 50 / 50 Split ── */}
      {count === 2 && (
        <div className="grid grid-cols-2 gap-1.5 rounded-[3px] overflow-hidden border border-black/10">
          {images.map((img, idx) => (
            <div
              key={img.id || idx}
              onClick={() => setActiveIdx(idx)}
              className="group relative h-60 sm:h-72 overflow-hidden bg-black/[0.02] cursor-zoom-in"
            >
              <img
                src={img.url}
                alt={img.caption || `${postTitle} photo ${idx + 1}`}
                draggable="true"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => downloadImage(img.url, idx, e)}
                  title="Download HD Photo"
                  className="p-1.5 bg-neutral-900/85 hover:bg-black text-white rounded-[2px] backdrop-blur-xs text-[10px] font-mono flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>HD</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 3 Images: 1 Left + 2 Stacked Right ── */}
      {count === 3 && (
        <div className="grid grid-cols-3 gap-1.5 rounded-[3px] overflow-hidden border border-black/10 h-72 sm:h-80">
          {/* Main Left Image (Span 2 cols) */}
          <div
            onClick={() => setActiveIdx(0)}
            className="group relative col-span-2 h-full overflow-hidden bg-black/[0.02] cursor-zoom-in"
          >
            <img
              src={images[0].url}
              alt={images[0].caption || postTitle}
              draggable="true"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => downloadImage(images[0].url, 0, e)}
                title="Download HD Photo"
                className="p-1.5 bg-neutral-900/85 hover:bg-black text-white rounded-[2px] backdrop-blur-xs text-[10px] font-mono flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>HD</span>
              </button>
            </div>
          </div>

          {/* Right 2 Stacked Images */}
          <div className="grid grid-rows-2 gap-1.5 h-full">
            {images.slice(1, 3).map((img, i) => {
              const realIdx = i + 1;
              return (
                <div
                  key={img.id || realIdx}
                  onClick={() => setActiveIdx(realIdx)}
                  className="group relative h-full overflow-hidden bg-black/[0.02] cursor-zoom-in"
                >
                  <img
                    src={img.url}
                    alt={img.caption || `${postTitle} photo ${realIdx + 1}`}
                    draggable="true"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => downloadImage(img.url, realIdx, e)}
                      title="Download HD Photo"
                      className="p-1 bg-neutral-900/85 hover:bg-black text-white rounded-[2px] backdrop-blur-xs text-[10px] font-mono flex items-center cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4+ Images: 2x2 Grid with +N counter ── */}
      {count >= 4 && (
        <div className="grid grid-cols-2 gap-1.5 rounded-[3px] overflow-hidden border border-black/10 h-72 sm:h-80">
          {images.slice(0, 4).map((img, idx) => {
            const isLast = idx === 3 && count > 4;
            return (
              <div
                key={img.id || idx}
                onClick={() => setActiveIdx(idx)}
                className="group relative h-full overflow-hidden bg-black/[0.02] cursor-zoom-in"
              >
                <img
                  src={img.url}
                  alt={img.caption || `${postTitle} photo ${idx + 1}`}
                  draggable="true"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />

                {isLast && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-mono text-xl font-bold backdrop-blur-2xs">
                    +{count - 3}
                  </div>
                )}

                {!isLast && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => downloadImage(img.url, idx, e)}
                      title="Download HD Photo"
                      className="p-1 bg-neutral-900/85 hover:bg-black text-white rounded-[2px] backdrop-blur-xs text-[10px] font-mono flex items-center cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Fullscreen HD Lightbox Modal ── */}
      {activeImage && activeIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveIdx(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/94 backdrop-blur-md p-4 sm:p-6 cursor-zoom-out animate-in fade-in duration-150 select-none"
        >
          {/* Lightbox Header */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl flex items-center justify-between text-white/80 font-mono text-xs pb-3 border-b border-white/10"
          >
            <div className="flex items-center space-x-2 truncate max-w-md">
              <span className="font-bold text-white tracking-wider truncate">
                {postTitle}
              </span>
              <span className="text-white/40">&bull;</span>
              <span className="text-white/60 text-[11px]">
                {activeIdx + 1} / {count}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => downloadImage(activeImage.url, activeIdx, e)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white text-white hover:text-black rounded-[2px] font-mono text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download HD Original</span>
              </button>

              <button
                onClick={() => setActiveIdx(null)}
                className="p-1 text-white/60 hover:text-white rounded-[2px] hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Image Stage with Prev/Next buttons */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 flex items-center justify-center w-full max-w-5xl my-4 overflow-hidden"
          >
            {count > 1 && (
              <button
                onClick={() =>
                  setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : count - 1))
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            <img
              src={activeImage.url}
              alt={activeImage.caption || postTitle}
              className="max-h-[80vh] max-w-full object-contain rounded-[2px] shadow-2xl transition-all"
            />

            {count > 1 && (
              <button
                onClick={() =>
                  setActiveIdx((prev) => (prev !== null && prev < count - 1 ? prev + 1 : 0))
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Lightbox Caption */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl text-center font-mono text-xs text-white/60 py-2 border-t border-white/10"
          >
            {activeImage.caption || `High-Resolution Capture • Original Uncompressed Media`}
          </div>
        </div>
      )}
    </div>
  );
}
