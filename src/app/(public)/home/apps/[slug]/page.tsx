import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Code2, ExternalLink, Cpu, CheckCircle2, ShieldCheck, Download } from "lucide-react";
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

export const revalidate = 3600; // Revalidate every hour (ISR)

export async function generateStaticParams() {
  const apps = await getApps();
  return apps.map((app) => ({ slug: app.slug }));
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* ── Top Navigation Link ── */}
      <div>
        <Link
          href="/home/apps"
          className="inline-flex items-center space-x-2 font-mono text-xs tracking-wider uppercase text-black/60 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ALL PROJECTS</span>
        </Link>
      </div>

      {/* ── Centered Project Header ── */}
      <div className="text-center space-y-3 pt-1 pb-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-[4px] bg-black text-white font-medium">
            {app.category}
          </span>
        </div>

        <h1 className="font-sans text-4xl sm:text-5xl font-bold tracking-tight text-black">
          {app.title}
        </h1>
      </div>

      {/* ── Framed Carousel Showcase ── */}
      <section className="w-full">
        <AppCarousel images={app.carousel_images} title={app.title} />
      </section>

      {/* ── Action Buttons Row ── */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 pb-6 border-b border-black/10">
        {/* Direct GDrive Install Modal */}
        {app.gdrive_url && (
          <InstallModal
            appTitle={app.title}
            version={app.version}
            gdriveUrl={app.gdrive_url}
            installInstructions={app.install_instructions}
          />
        )}

        {/* GitHub Repo Button */}
        {app.repo_url && (
          <a href={app.repo_url} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="font-mono text-xs rounded-[4px]">
              <Code2 className="mr-1.5 h-3.5 w-3.5 stroke-[1.5]" />
              <span>GitHub Repository</span>
              <ExternalLink className="ml-1.5 h-3 w-3 opacity-60" />
            </Button>
          </a>
        )}
      </div>

      {/* ── App Description & Purpose Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
        {/* Main Content: Purpose & How It's Used */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-black/10 rounded-[4px] bg-white/60 p-6 sm:p-7 shadow-xs">
            <h2 className="font-sans text-lg font-bold text-black pb-3 border-b border-black/10 mb-4">
              Project Overview & Purpose
            </h2>

            <div className="prose prose-sm max-w-none text-black/80 font-normal leading-relaxed prose-headings:font-sans prose-headings:font-bold prose-headings:text-black prose-headings:tracking-tight prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-black prose-code:font-mono prose-code:text-black prose-code:bg-black/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-[2px]">
              {app.description ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {app.description}
                </ReactMarkdown>
              ) : (
                <p>No description provided for this application.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Technical Specifications & Highlights */}
        <div className="space-y-5">
          {/* Tech Stack */}
          <div className="border border-black/10 rounded-[4px] bg-white/60 p-5 shadow-xs space-y-3">
            <h3 className="font-mono text-xs uppercase tracking-wider text-black font-semibold flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Technology Stack</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {app.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-xs bg-black/5 border border-black/10 px-2 py-1 text-black rounded-[2px]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Details */}
          <div className="border border-black/10 rounded-[4px] bg-white/60 p-5 shadow-xs space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center text-black/60 pb-2 border-b border-black/5">
              <span>Category</span>
              <span className="text-black font-medium">{app.category}</span>
            </div>
            <div className="flex justify-between items-center text-black/60 pb-2 border-b border-black/5">
              <span>Status</span>
              <span className="text-black font-medium">{app.badge}</span>
            </div>
            <div className="flex justify-between items-center text-black/60 pb-2 border-b border-black/5">
              <span>Version</span>
              <span className="text-black font-medium">{app.version}</span>
            </div>
            <div className="flex justify-between items-center text-black/60 pb-2 border-b border-black/5">
              <span>Created</span>
              <span className="text-black">{formatDate(app.created_at)}</span>
            </div>
            <div className="flex justify-between items-center text-black/60 pt-1">
              <span>Offline Ready</span>
              <span className="text-emerald-700 font-medium flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Yes (100% Local)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
