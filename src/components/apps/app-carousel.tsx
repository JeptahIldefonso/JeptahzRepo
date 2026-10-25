"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, ZoomIn, ExternalLink } from "lucide-react";

export interface CarouselImage {
  url: string;
  caption?: string;
}

interface AppCarouselProps {
  images: CarouselImage[];
  title: string;
}

const SWIPE_THRESHOLD_PX = 48;

export function AppCarousel({ images, title }: AppCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchX = useRef<number | null>(null);

  const count = images?.length || 0;

  const step = useCallback(
    (delta: number) => {
      if (count <= 1) return;
      setCurrentIndex((i) => (i + delta + count) % count);
    },
    [count]
  );

  // Keyboard navigation for arrow keys and escape key
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setZoomed(false);
      } else if (event.key === "ArrowLeft") {
        step(-1);
      } else if (event.key === "ArrowRight") {
        step(1);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  // Lock body scroll while zoomed
  useEffect(() => {
    if (zoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [zoomed]);

  if (!images || count === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center border border-black/15 bg-white/50 text-xs font-mono text-black/40 rounded-[2px]">
        No preview images available
      </div>
    );
  }

  const currentImg = images[currentIndex] || images[0];

  function onTouchStart(event: React.TouchEvent) {
    touchX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: React.TouchEvent) {
    if (touchX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchX.current;
    const dx = endX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
      step(dx < 0 ? 1 : -1);
    }
  }

  return (
    <div className="relative w-full select-none space-y-4">
      {/* ── Main Carousel Stage ── */}
      <div
        className="relative flex items-center justify-center w-full px-2 sm:px-12"
        onTouchStart={count > 1 ? onTouchStart : undefined}
        onTouchEnd={count > 1 ? onTouchEnd : undefined}
      >
        {/* Left Arrow Button matching screenshot */}
        {count > 1 && (
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous screenshot"
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full text-black/60 hover:text-black hover:bg-black/5 transition-all text-xl cursor-pointer"
          >
            ←
          </button>
        )}

        {/* Framed Window Screen Plate matching screenshot */}
        <div
          onClick={() => setZoomed(true)}
          className="group relative w-full max-w-5xl rounded-[6px] border border-black/15 bg-white/70 backdrop-blur-md p-3 sm:p-5 shadow-sm hover:border-black/40 transition-all duration-300 cursor-zoom-in"
        >
          <div className="relative flex items-center justify-center w-full min-h-[260px] sm:min-h-[440px] max-h-[620px] overflow-hidden rounded-[4px] bg-black/[0.02]">
            <div className="relative w-full h-[260px] sm:h-[440px] max-h-[580px]">
              <Image
                src={currentImg.url}
                alt={currentImg.caption || `${title} screenshot ${currentIndex + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-contain rounded-[2px] transition-transform duration-300 group-hover:scale-[1.008]"
                priority={currentIndex === 0}
              />
            </div>

            {/* Hover Zoom Pill Indicator */}
            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white px-2 py-1 rounded-[2px] font-mono text-[10px] tracking-wider flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-3 h-3" />
              <span>CLICK FOR FULLSCREEN</span>
            </div>
          </div>
        </div>

        {/* Right Arrow Button matching screenshot */}
        {count > 1 && (
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next screenshot"
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full text-black/60 hover:text-black hover:bg-black/5 transition-all text-xl cursor-pointer"
          >
            →
          </button>
        )}
      </div>

      {/* Mobile touch arrows */}
      {count > 1 && (
        <div className="flex sm:hidden items-center justify-center space-x-8 pt-1">
          <button
            onClick={() => step(-1)}
            className="px-4 py-1 text-sm font-mono border border-black/15 rounded-[2px] bg-white/60"
          >
            ← Prev
          </button>
          <button
            onClick={() => step(1)}
            className="px-4 py-1 text-sm font-mono border border-black/15 rounded-[2px] bg-white/60"
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Bottom Counter Indicator (e.g. "01 / 06") ── */}
      {count > 1 && (
        <div className="text-center font-mono text-xs text-black/70 tracking-[0.25em] pt-1">
          {String(currentIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </div>
      )}

      {/* Optional Caption */}
      {currentImg.caption && (
        <p className="text-center font-mono text-xs text-black/50 italic">
          {currentImg.caption}
        </p>
      )}

      {/* ── Fullscreen Lightbox Zoom Modal ── */}
      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/92 backdrop-blur-md p-4 sm:p-6 select-none cursor-zoom-out animate-in fade-in duration-150"
        >
          {/* Top Header in Lightbox */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl flex items-center justify-between text-white/80 font-mono text-xs pb-3 border-b border-white/10"
          >
            <div className="flex items-center space-x-3">
              <span className="font-bold text-white tracking-wider">
                {title}
              </span>
              <span className="text-white/40">&bull;</span>
              <span className="text-white/70">
                {String(currentIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
              {currentImg.caption && (
                <>
                  <span className="text-white/40">&bull;</span>
                  <span className="text-white/60 italic truncate max-w-md">
                    {currentImg.caption}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={currentImg.url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-[2px]"
                title="Open original high-res image"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setZoomed(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-[2px]"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Image with side arrows in Zoom mode */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 w-full max-w-6xl flex items-center justify-center p-2 cursor-default"
          >
            {count > 1 && (
              <button
                type="button"
                onClick={() => step(-1)}
                className="absolute left-2 sm:left-4 z-20 h-12 w-12 flex items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 transition-colors text-2xl"
                aria-label="Previous"
              >
                ←
              </button>
            )}

            <img
              src={currentImg.url}
              alt={currentImg.caption || `${title} screenshot`}
              className="max-h-[82vh] max-w-full object-contain rounded-[3px] shadow-2xl"
            />

            {count > 1 && (
              <button
                type="button"
                onClick={() => step(1)}
                className="absolute right-2 sm:right-4 z-20 h-12 w-12 flex items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 transition-colors text-2xl"
                aria-label="Next"
              >
                →
              </button>
            )}
          </div>

          {/* Bottom Footer Tip */}
          <div className="font-mono text-[10px] text-white/40 tracking-wider">
            USE ← / → ARROWS TO NAVIGATE &bull; ESC TO CLOSE
          </div>
        </div>
      )}
    </div>
  );
}
