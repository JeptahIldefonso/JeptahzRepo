"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { RIGHT_PANEL_DATA, RightPanelData } from "@/lib/floating-panel-data";

interface RightFloatingPanelProps {
  customData?: Partial<RightPanelData>;
}

export function RightFloatingPanel({ customData }: RightFloatingPanelProps) {
  const data = {
    promo: { ...RIGHT_PANEL_DATA.promo, ...customData?.promo },
    changelog: { ...RIGHT_PANEL_DATA.changelog, ...customData?.changelog },
  };

  const [promoDismissed, setPromoDismissed] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("dismissed_right_rail_promo");
      if (dismissed === "true") {
        setPromoDismissed(true);
      }
    } catch {}
  }, []);

  function handleDismiss() {
    setPromoDismissed(true);
    try {
      localStorage.setItem("dismissed_right_rail_promo", "true");
    } catch {}
  }

  return (
    <aside
      aria-label="Announcements and Changelog"
      className="w-full space-y-3.5 select-none animate-in fade-in duration-300"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. Top Announcement / Promo Card (Styled in #041a24)
         ───────────────────────────────────────────────────────────── */}
      {!promoDismissed && (
        <div className="relative rounded-[10px] border border-white/10 bg-[#041a24] text-white overflow-hidden shadow-md transition-all hover:border-white/25">
          {/* Top Banner Graphic (Custom Image or Built-in GitHub Universe Style Pixel Art) */}
          <div className="relative w-full h-[85px] overflow-hidden bg-[#062432]">
            {data.promo.bannerImageUrl ? (
              <Image
                src={data.promo.bannerImageUrl}
                alt={data.promo.title}
                fill
                className="object-cover"
              />
            ) : (
              /* Built-in GitHub Universe Pixel Art with Mascot Illustration */
              <div className="relative w-full h-full">
                {/* 3 Colorful Pixel Grid Blocks */}
                <div className="absolute inset-0 flex">
                  {/* Violet / Yellow Grid */}
                  <div
                    className="flex-1 bg-[#4d38f5] relative"
                    style={{
                      backgroundImage:
                        "radial-gradient(#e5a50a 6px, transparent 6px), radial-gradient(#e5a50a 6px, transparent 6px)",
                      backgroundSize: "24px 24px",
                      backgroundPosition: "0 0, 12px 12px",
                    }}
                  />
                  {/* Terracotta / Lilac Grid */}
                  <div
                    className="flex-1 bg-[#c84c1f] relative"
                    style={{
                      backgroundImage:
                        "radial-gradient(#e3a0f7 5px, transparent 5px), radial-gradient(#e3a0f7 5px, transparent 5px)",
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 10px 10px",
                    }}
                  />
                  {/* Emerald / Lime Grid */}
                  <div
                    className="flex-1 bg-[#0b8043] relative"
                    style={{
                      backgroundImage:
                        "radial-gradient(#56f08e 5px, transparent 5px), radial-gradient(#56f08e 5px, transparent 5px)",
                      backgroundSize: "22px 22px",
                      backgroundPosition: "0 0, 11px 11px",
                    }}
                  />
                </div>

                {/* GitHub Mascot Peeking Graphic */}
                <div className="absolute -top-3 right-8 w-16 h-16 pointer-events-none drop-shadow-md">
                  <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full transform -rotate-6"
                  >
                    <path
                      d="M20 70 C15 35, 45 15, 75 25 C88 30, 95 50, 90 75 C85 92, 45 95, 20 70 Z"
                      fill="#041a24"
                    />
                    <path d="M68 20 L80 5 L88 24 Z" fill="#041a24" />
                    <ellipse cx="62" cy="48" rx="22" ry="18" fill="#f8b6ab" />
                    <ellipse cx="64" cy="45" rx="8" ry="12" fill="#041a24" />
                    <ellipse cx="66" cy="41" rx="3.5" ry="5.5" fill="#ffffff" />
                    <circle cx="63" cy="50" r="1.5" fill="#ffffff" />
                    <circle cx="78" cy="48" r="2.5" fill="#c84c1f" />
                    <path
                      d="M74 53 Q77 56 81 53"
                      stroke="#041a24"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="p-3.5 space-y-3">
            {/* Header Row: Title & Close Button */}
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-black text-base tracking-tight text-white flex items-center space-x-1">
                <span>{data.promo.title}</span>
              </h3>
              {data.promo.dismissible && (
                <button
                  onClick={handleDismiss}
                  className="p-1 text-white/50 hover:text-white rounded-[4px] transition-colors cursor-pointer"
                  title="Dismiss announcement"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Description Text */}
            <p className="text-xs text-white/80 font-sans leading-relaxed">
              {data.promo.description}
            </p>

            {/* Action Button */}
            <Link
              href={data.promo.buttonHref}
              className="block w-full text-center"
              target={data.promo.buttonHref.startsWith("http") ? "_blank" : undefined}
              rel={data.promo.buttonHref.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              <button className="w-full h-8.5 rounded-md bg-white text-[#041a24] font-semibold text-xs hover:bg-neutral-100 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs">
                <span>{data.promo.buttonText}</span>
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. Bottom History / Changelog Card (Styled in #041a24)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-[10px] border border-white/10 bg-[#041a24] p-3.5 text-white shadow-md space-y-3 hover:border-white/20 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <h3 className="font-semibold text-xs font-sans text-white tracking-tight flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{data.changelog.title}</span>
          </h3>
        </div>

        {/* Timeline Stream */}
        <div className="relative pl-3 space-y-3.5 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/15">
          {data.changelog.items.map((item) => (
            <div key={item.id} className="relative pl-3 space-y-0.5 group">
              {/* Timeline Node Dot */}
              <span className="absolute -left-[10px] top-1.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-[#041a24] group-hover:scale-125 transition-transform" />

              {/* Timestamp */}
              <div className="font-mono text-[10px] text-white/50 font-normal">
                {item.timestamp}
              </div>

              {/* Title / Headline */}
              <Link
                href={item.href || "/home/docs"}
                className="block text-xs font-medium text-white hover:text-sky-300 hover:underline transition-colors leading-snug"
              >
                {item.title}
              </Link>

              {/* Description preview */}
              {item.description && (
                <p className="text-[11px] text-white/70 leading-normal line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer Link */}
        <div className="pt-2 border-t border-white/10">
          <Link
            href={data.changelog.viewAllHref}
            className="text-[11px] font-mono text-white/60 hover:text-white transition-colors inline-flex items-center space-x-1"
          >
            <span>{data.changelog.viewAllText}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
