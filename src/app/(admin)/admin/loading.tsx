import React from "react";
import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[45vh] space-y-3.5">
      <Loader2 className="w-6 h-6 animate-spin text-fg-subtle" />
      <p className="font-mono text-xs text-fg-subtle tracking-widest uppercase">
        Loading Curator Studio...
      </p>
    </div>
  );
}
