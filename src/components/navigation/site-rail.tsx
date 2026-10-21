"use client";

import React from "react";
import Link from "next/link";
import { AppType } from "@/db/data-provider";

interface SiteRailProps {
  apps?: AppType[];
}

export function SiteRail({ apps = [] }: SiteRailProps) {
  const visibleApps = apps.slice(0, 5);

  return (
    <aside className="hidden xl:flex fixed left-6 top-24 z-30 w-40 flex-col space-y-8 font-mono text-xs select-none">
      {/* CONNECT Section */}
      <div className="space-y-2.5">
        <div className="text-[10px] tracking-[0.2em] text-black/50 uppercase border-b border-black/10 pb-1">
          CONNECT
        </div>
        <ul className="space-y-1.5 text-[11px]">
          <li>
            <a
              href="https://github.com/JeptahIldefonso"
              target="_blank"
              rel="noreferrer"
              className="text-black/70 hover:text-black transition-colors flex items-center justify-between group"
            >
              <span>GITHUB</span>
              <span className="text-[10px] opacity-60 group-hover:opacity-100">↗</span>
            </a>
          </li>
          <li>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="text-black/70 hover:text-black transition-colors flex items-center justify-between group"
            >
              <span>FACEBOOK</span>
              <span className="text-[10px] opacity-60 group-hover:opacity-100">↗</span>
            </a>
          </li>
          <li>
            <Link
              href="/home/contact"
              className="text-black/70 hover:text-black transition-colors block"
            >
              <span>CONTACT NO.</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* PROJECTS Section */}
      <div className="space-y-2.5">
        <div className="text-[10px] tracking-[0.2em] text-black/50 uppercase border-b border-black/10 pb-1">
          PROJECTS
        </div>
        <ul className="space-y-2 text-[11px]">
          {visibleApps.map((app, index) => {
            const num = String(index + 1).padStart(2, "0");
            const shortTitle =
              app.title.length > 13
                ? `${app.title.slice(0, 11).toUpperCase()}...`
                : app.title.toUpperCase();

            return (
              <li key={app.id}>
                <Link
                  href={`/home/apps/${app.slug}`}
                  className="text-black/70 hover:text-black transition-colors flex items-baseline space-x-2 group"
                >
                  <span className="text-[9px] text-black/40 group-hover:text-black">{num}</span>
                  <span className="truncate">{shortTitle}</span>
                </Link>
              </li>
            );
          })}
          <li className="pt-1">
            <Link
              href="/home/apps"
              className="text-black font-medium hover:underline flex items-center justify-between group text-[10px] tracking-wider"
            >
              <span>ALL PROJECTS</span>
              <span className="text-[10px]">↗</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Signature Image */}
      <div className="pt-2 opacity-80">
        <img
          src="/signature.png"
          alt="Signature"
          className="w-28 h-auto object-contain filter grayscale"
        />
      </div>
    </aside>
  );
}
