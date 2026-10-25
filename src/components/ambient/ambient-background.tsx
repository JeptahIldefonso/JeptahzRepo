"use client";

import dynamic from "next/dynamic";

const BotanicalCanvas = dynamic(
  () =>
    import("@/components/ambient/botanical-canvas").then(
      (mod) => mod.BotanicalCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden bg-[#041a24]"
        aria-hidden="true"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(4, 26, 36, 0.70) 85%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[#041a24]/20" />
      </div>
    ),
  }
);

export function AmbientBackground() {
  return <BotanicalCanvas />;
}
