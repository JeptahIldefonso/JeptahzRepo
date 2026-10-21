import React from "react";
import Link from "next/link";
import { ArrowRight, Code2 } from "lucide-react";
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
    <article className="border border-border bg-bg-raised rounded-[2px] overflow-hidden flex flex-col justify-between hover:border-fg transition-all duration-150">
      {/* Thumbnail Banner */}
      <div className="relative aspect-video w-full bg-bg border-b border-border overflow-hidden group">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={app.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-101"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-xs text-fg-subtle">
            No Preview Frame
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1 font-mono">
          <Badge variant="default" className="text-[10px]">{app.version}</Badge>
          <Badge variant="subtle" className="text-[10px]">{app.category}</Badge>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <Link href={`/home/apps/${app.slug}`}>
            <h3 className="font-editorial text-2xl font-normal text-fg hover:underline leading-snug">
              {app.title}
            </h3>
          </Link>
          <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed">
            {app.tagline}
          </p>
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-1 pt-1">
          {app.tech_stack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[9px] bg-bg border border-border px-1.5 py-0.5 text-fg rounded-[1px]"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Controls */}
        <div className="border-t border-border pt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {/* Direct GDrive Install Trigger */}
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
                  <Code2 className="mr-1 h-3.5 w-3.5" />
                  <span>Repo</span>
                </Button>
              </a>
            )}
          </div>

          <Link href={`/home/apps/${app.slug}`}>
            <Button variant="ghost" size="sm" className="px-2" title="Inspect Deep Dive">
              <span className="sr-only">Details</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
