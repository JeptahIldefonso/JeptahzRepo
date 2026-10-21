"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/modal";

interface CarouselImage {
  url: string;
  caption?: string;
}

interface AppCarouselProps {
  images: CarouselImage[];
  title: string;
}

export function AppCarousel({ images, title }: AppCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center border border-border bg-bg-raised text-xs font-mono text-fg-subtle">
        No preview images available
      </div>
    );
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const currentImg = images[currentIndex];

  return (
    <div className="relative w-full overflow-hidden border border-border bg-bg-raised rounded-[2px] group">
      {/* Main Image Viewport */}
      <div className="relative aspect-video w-full overflow-hidden bg-bg">
        <img
          src={currentImg.url}
          alt={currentImg.caption || `${title} screenshot ${currentIndex + 1}`}
          className="h-full w-full object-cover transition-opacity duration-300"
        />

        {/* Zoom Lightbox Trigger */}
        <button
          onClick={() => setZoomOpen(true)}
          className="absolute top-3 right-3 rounded-[2px] bg-bg-raised/90 p-1.5 text-fg shadow-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bg-raised cursor-pointer"
          title="Expand Screenshot"
        >
          <Maximize2 className="h-3.5 w-3.5 stroke-[1.5]" />
        </button>

        {/* Carousel Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-[2px] bg-bg-raised/90 p-2 text-fg shadow-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bg-raised cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4 stroke-[1.5]" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[2px] bg-bg-raised/90 p-2 text-fg shadow-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bg-raised cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4 stroke-[1.5]" />
            </button>
          </>
        )}

        {/* Caption Bar */}
        {currentImg.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-fg/80 px-4 py-2 text-xs font-mono text-bg-raised backdrop-blur-xs flex items-center justify-between">
            <span className="truncate">{currentImg.caption}</span>
            <span className="text-[10px] text-bg-raised/70 shrink-0 ml-4">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Bar */}
      {images.length > 1 && (
        <div className="flex gap-2 p-2 border-t border-border bg-bg overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-12 w-20 shrink-0 overflow-hidden rounded-[2px] border transition-all cursor-pointer ${
                idx === currentIndex
                  ? "border-fg ring-1 ring-fg"
                  : "border-border opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Zoom Lightbox Modal */}
      <Modal open={zoomOpen} onOpenChange={setZoomOpen}>
        <ModalContent className="max-w-4xl p-2" title={`${title} — Preview`}>
          <div className="relative aspect-video w-full overflow-hidden bg-black">
            <img
              src={currentImg.url}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
          {currentImg.caption && (
            <div className="p-3 text-xs font-mono text-fg-subtle">
              {currentImg.caption}
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
