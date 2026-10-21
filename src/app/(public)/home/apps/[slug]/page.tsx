import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Code2, ExternalLink, Calendar, HardDrive, Cpu } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAppBySlug, getApps } from "@/db/data-provider";
import { AppCarousel } from "@/components/apps/app-carousel";
import { InstallModal } from "@/components/apps/install-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface AppDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back Navigation Trail */}
      <Link
        href="/home/apps"
        className="inline-flex items-center space-x-1.5 font-mono text-xs text-fg-subtle hover:text-fg transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Software Showcase</span>
      </Link>

      {/* Header Info */}
      <div className="border-b border-border pb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">{app.version}</Badge>
          <Badge variant="subtle">{app.category}</Badge>
          <span className="font-mono text-xs text-fg-subtle">Status: {app.badge}</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-fg">
          {app.title}
        </h1>
        <p className="text-base text-fg-muted leading-relaxed">
          {app.tagline}
        </p>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Direct GDrive Install Trigger */}
          <InstallModal
            appTitle={app.title}
            version={app.version}
            gdriveUrl={app.gdrive_url}
            installInstructions={app.install_instructions}
          />

          {/* GitHub Repo Button */}
          {app.repo_url && (
            <a href={app.repo_url} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <Code2 className="mr-1.5 h-3.5 w-3.5 stroke-[1.5]" />
                <span>GitHub Repository</span>
                <ExternalLink className="ml-1.5 h-3 w-3 opacity-60" />
              </Button>
            </a>
          )}

          {/* Live Preview Button */}
          {app.demo_url && (
            <a href={app.demo_url} target="_blank" rel="noreferrer">
              <Button variant="subtle" size="sm">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5 stroke-[1.5]" />
                <span>Live Preview</span>
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Interactive Screenshot Carousel (Feature 3) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
            Screenshot Vault & Interface Previews
          </span>
          <span className="font-mono text-[10px] text-fg-subtle">
            {app.carousel_images.length} Captured Frames
          </span>
        </div>
        <AppCarousel images={app.carousel_images} title={app.title} />
      </section>

      {/* Deep-Dive Architectural Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 space-y-6">
          <div className="prose prose-sm max-w-none text-fg-muted font-normal leading-relaxed prose-headings:font-display prose-headings:text-fg prose-headings:font-medium prose-strong:text-fg prose-code:font-mono prose-code:text-fg prose-code:bg-bg-hover prose-code:px-1 prose-code:py-0.5 prose-code:rounded-[2px]">
            {app.description ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {app.description}
              </ReactMarkdown>
            ) : (
              <p>No comprehensive breakdown provided for this application.</p>
            )}
          </div>
        </div>

        {/* Technical Specification Sidebar */}
        <div className="space-y-6 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-6">
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-fg font-medium flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Technology Stack</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {app.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-xs bg-bg-raised border border-border px-2 py-1 text-fg rounded-[2px]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-4 text-xs font-mono">
            <div className="flex justify-between text-fg-subtle">
              <span>Release Date:</span>
              <span className="text-fg">{formatDate(app.created_at)}</span>
            </div>
            <div className="flex justify-between text-fg-subtle">
              <span>Category:</span>
              <span className="text-fg">{app.category}</span>
            </div>
            <div className="flex justify-between text-fg-subtle">
              <span>Distribution:</span>
              <span className="text-fg">Google Drive + GitHub</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
