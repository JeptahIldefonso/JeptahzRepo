import React from "react";
import { getApps } from "@/db/data-provider";
import { ProjectsExplorer } from "@/components/apps/projects-explorer";

export const metadata = {
  title: "Projects — JeptahzRepo",
  description: "Personal full-stack builds, software applications, mobile utilities, and developer tools.",
};

export default async function AppsShowcasePage() {
  const apps = await getApps();

  return <ProjectsExplorer initialApps={apps} />;
}
