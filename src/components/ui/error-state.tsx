"use client";

import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  reset?: () => void;
}

export function ErrorState({
  title = "System Anomaly Detected",
  message = "An unexpected error occurred while resolving this archival node.",
  reset,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-[2px] border border-border bg-bg-raised">
      <div className="mb-4 text-fg">
        <AlertCircle className="w-8 h-8 stroke-[1.25]" />
      </div>
      <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-fg mb-1">
        {title}
      </h3>
      <p className="text-xs text-fg-muted max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      {reset && (
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="w-3.5 h-3.5 mr-2 stroke-[1.5]" />
          Re-initialize Stream
        </Button>
      )}
    </div>
  );
}
