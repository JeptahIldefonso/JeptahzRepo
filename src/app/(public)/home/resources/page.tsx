import React from "react";
import { getEntries } from "@/db/data-provider";
import { ResourcesFeed } from "@/components/resources/resources-feed";

export const metadata = {
  title: "Resources & Links",
  description: "Curated developer resources, academic papers, documentation references, and toolkits.",
};

export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function ResourcesPage() {
  const entries = await getEntries({ topicSlug: "resources" });

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Header ── */}
      <div className="border-b border-border pb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-fg">
          Resources &amp; Links
        </h1>
        <p className="mt-1 text-sm text-fg-muted max-w-xl leading-relaxed">
          Resources, references, and tools.
        </p>
      </div>

      {/* ── Interactive Links Feed with Search & Formal Standard Spacing ── */}
      <ResourcesFeed initialEntries={entries} />
    </div>
  );
}
