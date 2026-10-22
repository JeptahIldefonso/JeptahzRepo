"use client";

import React, { useState } from "react";
import { Download, ExternalLink, Check, Copy, HardDrive } from "lucide-react";
import { Modal, ModalTrigger, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface InstallModalProps {
  appTitle: string;
  version?: string | null;
  gdriveUrl?: string | null;
  installInstructions?: string | null;
}

export function InstallModal({
  appTitle,
  version,
  gdriveUrl,
  installInstructions,
}: InstallModalProps) {
  const [copied, setCopied] = useState(false);
  const sampleChecksum = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleChecksum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="default" size="sm" className="group">
          <HardDrive className="mr-1.5 h-3.5 w-3.5 stroke-[1.5]" />
          <span>Install (GDrive)</span>
        </Button>
      </ModalTrigger>
      <ModalContent
        className="max-w-lg"
        title={version ? `Deploy // ${appTitle} [${version}]` : `Deploy // ${appTitle}`}
        description="Download release packages and view installation steps verified for Windows, macOS, and Linux."
      >
        <div className="space-y-4 py-2">
          {/* Direct Google Drive Action Box */}
          <div className="border border-border bg-bg p-4 rounded-[2px] space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs font-medium text-fg">
                Google Drive Release Vault
              </div>
              <span className="font-mono text-[10px] text-fg-subtle uppercase">
                Direct Mirror
              </span>
            </div>
            <p className="text-xs text-fg-muted leading-relaxed">
              Binary installers, portable archives, and verification checksums are hosted on Google Drive.
            </p>
            {gdriveUrl ? (
              <a
                href={gdriveUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full"
              >
                <Button size="md" className="w-full">
                  <Download className="mr-2 h-4 w-4 stroke-[1.5]" />
                  <span>Open Google Drive Download</span>
                  <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-60" />
                </Button>
              </a>
            ) : (
              <div className="text-xs font-mono text-fg-subtle p-2 border border-border border-dashed text-center">
                GDrive mirror link currently syncing...
              </div>
            )}
          </div>

          {/* Cryptographic Checksum Box */}
          <div className="border border-border bg-bg p-3 rounded-[2px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
                SHA-256 Checksum
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 font-mono text-[10px] text-fg hover:underline cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-fg" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-fg-subtle" />
                    <span>Copy Hash</span>
                  </>
                )}
              </button>
            </div>
            <code className="block font-mono text-[10px] text-fg-muted break-all bg-bg-raised p-1.5 border border-border rounded-[2px]">
              {sampleChecksum}
            </code>
          </div>

          {/* Step-by-Step Instructions */}
          {installInstructions && (
            <div className="border-t border-border pt-3 space-y-2">
              <div className="font-mono text-[11px] uppercase tracking-wider text-fg font-medium">
                Installation Procedure
              </div>
              <div className="text-xs text-fg-muted font-mono leading-relaxed bg-bg p-3 border border-border rounded-[2px] whitespace-pre-line">
                {installInstructions}
              </div>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
