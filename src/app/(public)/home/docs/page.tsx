import React from "react";
import { getEntries } from "@/db/data-provider";
import { DocsFeed } from "@/components/docs/docs-feed";

export const metadata = {
  title: "Notes & Docs",
  description: "Technical documentation, shared files, image captures, and written notes.",
};

export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function DocsTheoryPage() {
  const entries = await getEntries({ topicSlug: "docs" });

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Top Header ── */}
      <div className="border-b border-black/10 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-black">
              Notes & Docs
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-black/70 leading-relaxed">
              Technical documentation, shared files, image captures, and written notes.
            </p>
          </div>
        </div>
      </div>

      {/* ── Social Blog Feed Stream ── */}
      <DocsFeed initialEntries={entries} />
    </div>
  );
}
