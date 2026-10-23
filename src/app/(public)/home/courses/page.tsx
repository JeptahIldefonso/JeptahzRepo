import React from "react";
import { getEntries } from "@/db/data-provider";
import { CoursesFeed } from "@/components/courses/courses-feed";

export const metadata = {
  title: "Courses — Academic Repository",
  description: "Material, Course Information and Roadmaps.",
};

export default async function CoursesPage() {
  const entries = await getEntries({ topicSlug: "courses" });

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Top Header ── */}
      <div className="border-b border-black/10 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-black">
              Courses
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-black/70 leading-relaxed">
              Material, Course Information and Roadmaps.
            </p>
          </div>
        </div>
      </div>

      {/* ── Formal & Technical Academic Stream ── */}
      <CoursesFeed initialEntries={entries} />
    </div>
  );
}
