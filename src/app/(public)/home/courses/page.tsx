import React from "react";
import { getEntries } from "@/db/data-provider";
import { CoursesFeed } from "@/components/courses/courses-feed";

export const metadata = {
  title: "Courses & Curricula — Academic Repository",
  description: "Curated university computer science course modules, syllabi roadmaps, textbooks, and technical lecture materials.",
};

export default async function CoursesPage() {
  const entries = await getEntries({ topicSlug: "courses" });

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Top Header ── */}
      <div className="border-b border-black/10 pb-5">
        <div className="flex items-center space-x-2 text-black/40 mb-1.5">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase">
            Academic Repository // Curricula &amp; Syllabi
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-black">
              Courses &amp; Curricula
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-black/70 leading-relaxed">
              Structured university computer science modules, syllabi roadmaps, textbooks, and academic materials.
            </p>
          </div>
        </div>
      </div>

      {/* ── Formal & Technical Academic Stream ── */}
      <CoursesFeed initialEntries={entries} />
    </div>
  );
}
