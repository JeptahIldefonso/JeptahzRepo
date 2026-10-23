import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md border border-border bg-bg-raised p-8 rounded-[2px] shadow-sm space-y-4">
        <div className="flex justify-center text-fg">
          <Compass className="w-8 h-8 stroke-[1.25]" />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
          HTTP 404 • Node Missing
        </div>
        <h2 className="font-display text-2xl font-medium text-fg">
          Archival Record Unreachable
        </h2>
        <p className="text-xs text-fg-muted leading-relaxed">
          The requested document, application, or directory path does not exist in the active index.
        </p>

        <div className="pt-2">
          <Link href="/home">
            <Button variant="default" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Return to Community Hub</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
