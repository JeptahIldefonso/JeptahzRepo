import React from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  ExternalLink,
  GraduationCap,
  Code2,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { EntryType } from "@/db/data-provider";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatBytes } from "@/lib/utils";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  doc: <FileText className="w-3.5 h-3.5 stroke-[1.5]" />,
  course: <GraduationCap className="w-3.5 h-3.5 stroke-[1.5]" />,
  file: <Download className="w-3.5 h-3.5 stroke-[1.5]" />,
  link: <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />,
  idea: <Lightbulb className="w-3.5 h-3.5 stroke-[1.5]" />,
  project: <Code2 className="w-3.5 h-3.5 stroke-[1.5]" />,
};

interface EntryCardProps {
  entry: EntryType;
  basePath?: string;
}

export function EntryCard({ entry, basePath }: EntryCardProps) {
  const targetPath =
    basePath || `/home/${entry.topic_slug || "docs"}/${entry.slug}`;

  return (
    <article className="border border-border bg-bg-raised p-5 rounded-[2px] transition-all hover:border-fg flex flex-col justify-between space-y-4">
      <div className="space-y-2.5">
        {/* Header Tags & Metadata */}
        <div className="flex items-center justify-between font-mono text-[10px]">
          <div className="flex items-center space-x-1.5">
            <Badge variant="subtle" className="flex items-center space-x-1 py-0 px-1.5">
              <span>{TYPE_ICONS[entry.type] || <FileText className="w-3 h-3" />}</span>
              <span className="capitalize">{entry.type}</span>
            </Badge>
            {entry.is_pinned && (
              <Badge variant="default" className="py-0 px-1.5">
                PINNED
              </Badge>
            )}
          </div>
          <span className="text-fg-subtle">
            {formatDate(entry.created_at)}
          </span>
        </div>

        {/* Title */}
        <Link href={targetPath}>
          <h3 className="font-editorial text-2xl font-normal text-fg hover:underline leading-snug">
            {entry.title}
          </h3>
        </Link>

        {/* Summary */}
        {entry.summary && (
          <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed font-sans">
            {entry.summary}
          </p>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 font-mono text-[9px]">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="text-fg-subtle bg-bg border border-border px-1.5 py-0.5 rounded-[1px]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="border-t border-border/80 pt-3 flex items-center justify-between text-xs font-mono">
        <div className="text-[10px] text-fg-subtle">
          {entry.type === "file" && entry.file_size
            ? formatBytes(entry.file_size)
            : entry.metadata?.read_time || "Archival Node"}
        </div>

        <div className="flex items-center space-x-3">
          {entry.external_url && (
            <a
              href={entry.external_url}
              target="_blank"
              rel="noreferrer"
              className="text-fg-subtle hover:text-fg flex items-center space-x-1"
            >
              <span>Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <Link
            href={targetPath}
            className="text-fg group flex items-center space-x-1 hover:underline font-medium"
          >
            <span>Read</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
