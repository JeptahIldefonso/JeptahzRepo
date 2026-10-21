"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function IntroHero() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="space-y-8 sm:space-y-10">
        <h1 className="font-editorial text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-tight text-fg leading-none select-none">
          JeptahzRepo
        </h1>

        <div className="flex justify-center">
          <Link href="/home">
            <Button
              size="lg"
              className="h-12 px-8 sm:px-10 text-xs font-mono uppercase tracking-[0.18em] shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Enter Community Archive</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
