import React from "react";
import { Github, Twitter, Linkedin, HardDrive, Mail } from "lucide-react";
import { getSiteSettings } from "@/db/data-provider";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Connect with Jeptah for research collaboration, engineering inquiries, and systems development.",
};

export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="font-display text-3xl font-medium tracking-tight text-fg">
          Contact & Network
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          For research collaboration and inquiries.
        </p>
      </div>

      {/* Primary Channels */}
      <div className="space-y-4">
        {settings.contact_email && (
          <div className="border border-border bg-bg-raised p-5 rounded-[2px] flex items-center justify-between hover:border-[#041a24] transition-colors">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-fg stroke-[1.5]" />
              <div>
                <div className="font-mono text-xs text-fg font-medium">Direct Inquiries</div>
                <div className="text-xs text-fg-muted font-mono">{settings.contact_email}</div>
              </div>
            </div>
            <a href={`mailto:${settings.contact_email}`}>
              <Button size="sm">Send Mail</Button>
            </a>
          </div>
        )}

        <div className="border border-border bg-bg-raised p-5 rounded-[2px] space-y-4">
          <div className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
            Social & Developer Ecosystems
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {settings.social_links?.github && (
              <a
                href={settings.social_links.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border border-border bg-bg p-3 rounded-[2px] hover:border-[#041a24] text-xs font-mono text-fg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </div>
                <span className="text-fg-subtle text-[10px]">Open Profile</span>
              </a>
            )}
            {settings.social_links?.twitter && (
              <a
                href={settings.social_links.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border border-border bg-bg p-3 rounded-[2px] hover:border-[#041a24] text-xs font-mono text-fg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Twitter className="w-4 h-4" />
                  <span>Twitter / X</span>
                </div>
                <span className="text-fg-subtle text-[10px]">Connect</span>
              </a>
            )}
            {settings.social_links?.linkedin && (
              <a
                href={settings.social_links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border border-border bg-bg p-3 rounded-[2px] hover:border-[#041a24] text-xs font-mono text-fg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </div>
                <span className="text-fg-subtle text-[10px]">Network</span>
              </a>
            )}
            {settings.social_links?.gdrive && (
              <a
                href={settings.social_links.gdrive}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border border-border bg-bg p-3 rounded-[2px] hover:border-[#041a24] text-xs font-mono text-fg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4" />
                  <span>Google Drive Vault</span>
                </div>
                <span className="text-fg-subtle text-[10px]">Mirror</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
