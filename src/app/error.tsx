"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Archival Node Runtime Exception:", error);
    // Automatically recover from stale Webpack/Turbopack chunk loading mismatches
    if (
      error.message?.includes("Loading chunk") ||
      error.message?.includes("ChunkLoadError") ||
      error.name === "ChunkLoadError"
    ) {
      try {
        const lastReload = sessionStorage.getItem("chunk_reload_ts");
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 8000) {
          sessionStorage.setItem("chunk_reload_ts", String(now));
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md border border-border bg-bg-raised p-8 rounded-[2px] shadow-sm space-y-4">
        <div className="flex justify-center text-fg">
          <AlertCircle className="w-8 h-8 stroke-[1.25]" />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
          Archival Exception
        </div>
        <h2 className="font-display text-xl font-medium text-fg">
          System Anomaly Intercepted
        </h2>
        <p className="text-xs text-fg-muted leading-relaxed font-mono">
          {error.message || "An unhandled stream interruption occurred in this component tree."}
        </p>

        <div className="flex justify-center space-x-2 pt-2">
          <Button variant="default" size="sm" onClick={() => reset()}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>Re-try Pipeline</span>
          </Button>
          <Link href="/home">
            <Button variant="outline" size="sm">
              <Home className="w-3.5 h-3.5 mr-1.5" />
              <span>Hub</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
