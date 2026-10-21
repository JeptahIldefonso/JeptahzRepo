import React from "react";
import Link from "next/link";
import { ExternalLink, ArrowRight, Code2 } from "lucide-react";
import { AppType } from "@/db/data-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstallModal } from "./install-modal";

interface AppCardProps {
  app: AppType;
}

export function AppCard({ app }: AppCardProps) {
  const thumbnail = app.carousel_images[0]?.url || "";

  return (
    <div className="border border-border bg-bg-raised rounded-[2px] overflow-hidden flex flex-col justify-between hover:border-fg/40 transition-all duration-200">
      {/* Thumbnail Banner */}
      <div className="relative aspect-video w-full bg-bg border-b border-border overflow-hidden group">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={app.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-xs text-fg-subtle">
            No Preview Available
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <Badge variant="default">{app.version}</Badge>
          <Badge variant="subtle">{app.badge}</Badge>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
            {app.category}
          </div>
          <Link href={`/home/apps/${app.slug}`}>
            <h3 className="font-display text-xl font-medium text-fg hover:underline">
              {app.title}
            </h3>
          </Link>
          <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed">
            {app.tagline}
          </p>
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-1 pt-2">
          {app.tech_stack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[9px] bg-bg border border-border px-1.5 py-0.5 text-fg-subtle rounded-[2px]"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Controls */}
        <div className="border-t border-border pt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Direct GDrive Install Button & Modal */}
            <InstallModal
              appTitle={app.title}
              version={app.version}
              gdriveUrl={app.gdrive_url}
              installInstructions={app.install_instructions}
            />

            {/* View Repo Button */}
            {app.repo_url && (
              <a
                href={app.repo_url}
                target="_blank"
                rel="noreferrer"
                title="View GitHub Repository"
              >
                <Button variant="outline" size="sm">
                  <Code2 className="mr-1.5 h-3.5 w-3.5 stroke-[1.5]" />
                  <span>Repo</span>
                </Button>
              </a>
            )}
          </div>

          <Link href={`/home/apps/${app.slug}`}>
            <Button variant="ghost" size="sm" className="px-2">
              <span className="sr-only">Deep Dive</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
