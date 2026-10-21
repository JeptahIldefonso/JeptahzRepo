import React from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  ExternalLink,
  BookOpen,
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
    <div className="border border-border bg-bg-raised p-6 rounded-[2px] transition-all hover:border-fg/40 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header Tags */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="subtle" className="flex items-center space-x-1">
              <span>{TYPE_ICONS[entry.type] || <FileText className="w-3 h-3" />}</span>
              <span className="capitalize">{entry.type}</span>
            </Badge>
            {entry.is_pinned && (
              <Badge variant="default" className="text-[9px]">
                PINNED
              </Badge>
            )}
          </div>
          <span className="font-mono text-[10px] text-fg-subtle">
            {formatDate(entry.created_at)}
          </span>
        </div>

        {/* Title */}
        <Link href={targetPath}>
          <h3 className="font-display text-xl font-medium text-fg hover:underline">
            {entry.title}
          </h3>
        </Link>

        {/* Summary */}
        {entry.summary && (
          <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed">
            {entry.summary}
          </p>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] text-fg-subtle bg-bg border border-border px-1.5 py-0.5 rounded-[2px]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="mt-6 border-t border-border/60 pt-3 flex items-center justify-between">
        <div className="font-mono text-[10px] text-fg-subtle">
          {entry.type === "file" && entry.file_size
            ? formatBytes(entry.file_size)
            : entry.metadata?.read_time || "Reference Entry"}
        </div>

        <div className="flex items-center space-x-2">
          {entry.external_url && (
            <a
              href={entry.external_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-fg-subtle hover:text-fg flex items-center space-x-1"
            >
              <span>Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <Link
            href={targetPath}
            className="text-xs font-mono text-fg group flex items-center space-x-1 hover:underline"
          >
            <span>Open</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
