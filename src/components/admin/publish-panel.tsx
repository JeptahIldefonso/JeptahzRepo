"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Loader2,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Clock,
  GitCommit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal, ModalContent } from "@/components/ui/modal";

interface PublishStatus {
  state: "ready" | "idle" | "publishing" | "error";
  liveHash: string;
  savedHash: string;
  isUpToDate: boolean;
  canPublish: boolean;
  canRevert: boolean;
  lastPublishedAt: string | null;
  deploymentUrl: string | null;
  commitSha: string | null;
  commitUrl: string | null;
  error: string | null;
  history: Array<{
    sha: string;
    shortSha: string;
    message: string;
    date: string;
    author: string;
    url: string;
  }>;
  isConfigured: {
    github: boolean;
    vercel: boolean;
  };
  statusMessage: string;
}

export function PublishPanel() {
  const [status, setStatus] = useState<PublishStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishingAction, setIsPublishingAction] = useState(false);
  const [isRevertingAction, setIsRevertingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<"live" | "saved" | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const res = await fetch("/api/admin/publish/status", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Status check failed: HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setStatus(data);
        setErrorMessage(null);
      } else {
        setErrorMessage(data.error || "Failed to load publish status");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Polling while publishing
  useEffect(() => {
    if (status?.state === "publishing") {
      pollingTimerRef.current = setInterval(() => {
        fetchStatus(true);
      }, 3000);
    } else {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    }

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [status?.state, fetchStatus]);

  // Copy to clipboard helper
  const copyToClipboard = (text: string, field: "live" | "saved") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Publish action
  const handlePublish = async () => {
    setShowPublishModal(false);
    setIsPublishingAction(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.success) {
        setToastMessage({
          type: "success",
          text: `Publish initiated! Commit ${data.commitSha.slice(0, 7)} created. Deploying to Vercel...`,
        });
        await fetchStatus(true);
      } else {
        setErrorMessage(data.error || "Publish failed");
        setToastMessage({ type: "error", text: data.error || "Publish failed" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Publish request failed";
      setErrorMessage(msg);
      setToastMessage({ type: "error", text: msg });
    } finally {
      setIsPublishingAction(false);
    }
  };

  // Revert action
  const handleRevert = async () => {
    setShowRevertModal(false);
    setIsRevertingAction(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/publish/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.success) {
        setToastMessage({
          type: "success",
          text: `Revert initiated! Restoring to commit ${data.commitSha.slice(0, 7)} on Vercel...`,
        });
        await fetchStatus(true);
      } else {
        setErrorMessage(data.error || "Revert failed");
        setToastMessage({ type: "error", text: data.error || "Revert failed" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Revert request failed";
      setErrorMessage(msg);
      setToastMessage({ type: "error", text: msg });
    } finally {
      setIsRevertingAction(false);
    }
  };

  // Clear toast after 5s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const liveHash = status?.liveHash || "------------";
  const savedHash = status?.savedHash || "------------";
  const isUpToDate = status ? status.isUpToDate : true;
  const isPublishing = status?.state === "publishing" || isPublishingAction || isRevertingAction;
  const canPublish = status ? status.canPublish && !isPublishing : false;
  const canRevert = status ? status.canRevert && !isPublishing : false;

  const previousSnapshot = status?.history && status.history.length > 1 ? status.history[1] : null;

  return (
    <>
      <div className="bg-bg-raised border border-border rounded-[12px] p-6 sm:p-7 shadow-xs relative overflow-hidden transition-all">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`mb-4 px-4 py-2.5 rounded-[8px] text-xs font-mono flex items-center justify-between border ${
              toastMessage.type === "success"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                : toastMessage.type === "error"
                ? "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
                : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
            }`}
          >
            <div className="flex items-center space-x-2">
              {toastMessage.type === "success" && <Check className="w-3.5 h-3.5" />}
              {toastMessage.type === "error" && <AlertCircle className="w-3.5 h-3.5" />}
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-fg-subtle hover:text-fg ml-3 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-fg">
                Publish
              </h2>
              <button
                onClick={() => fetchStatus()}
                disabled={isLoading}
                title="Refresh deployment status"
                className="text-fg-muted hover:text-fg transition-colors p-1 rounded hover:bg-bg-hover cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-fg-muted mt-1 leading-relaxed">
              {status?.state === "publishing"
                ? "Publishing to Vercel... This may take up to a minute."
                : status?.state === "error"
                ? "The last publish attempt failed. Check error details below."
                : isUpToDate
                ? "The live site matches your saved content."
                : "You have unpublished changes ready to be deployed."}
            </p>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {status?.state === "publishing" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                Publishing…
              </span>
            ) : status?.state === "error" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Publish failed
              </span>
            ) : isUpToDate ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live and up to date
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Unpublished changes
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center flex-wrap gap-3 mt-5">
          <Button
            onClick={() => setShowPublishModal(true)}
            disabled={!canPublish}
            className="h-10 px-6 font-mono text-xs font-bold uppercase tracking-[0.14em] shadow-sm bg-fg text-bg-raised hover:bg-fg/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPublishingAction ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Publishing…
              </>
            ) : (
              "PUBLISH"
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowRevertModal(true)}
            disabled={!canRevert}
            className="h-10 px-5 font-mono text-xs font-bold uppercase tracking-[0.14em] border-border text-fg hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRevertingAction ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Reverting…
              </>
            ) : (
              "REVERT TO PREVIOUS"
            )}
          </Button>

          {/* Direct deployment link */}
          {status?.deploymentUrl && (
            <a
              href={status.deploymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs font-mono text-fg-subtle hover:text-fg ml-auto transition-colors"
            >
              <span>View live</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Error notice if present */}
        {(errorMessage || status?.error) && (
          <div className="mt-4 p-3 rounded-[6px] bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-mono flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage || status?.error}</div>
          </div>
        )}

        {/* Missing token configuration hint for development */}
        {status && (!status.isConfigured.github || !status.isConfigured.vercel) && (
          <div className="mt-4 p-3 rounded-[6px] bg-bg-hover/80 border border-border/70 text-[11px] text-fg-muted font-mono leading-relaxed">
            <span className="font-semibold text-fg">Tip: </span>
            {!status.isConfigured.github && (
              <span>Add <code className="bg-bg px-1 py-0.5 rounded border border-border">GITHUB_TOKEN</code> in your environment variables to commit and deploy directly to GitHub main. </span>
            )}
            {!status.isConfigured.vercel && (
              <span>Add <code className="bg-bg px-1 py-0.5 rounded border border-border">VERCEL_TOKEN</code> and <code className="bg-bg px-1 py-0.5 rounded border border-border">VERCEL_PROJECT_ID</code> to track live build status.</span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border my-5" />

        {/* Monospace Hash Chips Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-8 text-xs font-mono">
            {/* Live Content Hash */}
            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-fg-muted font-medium mb-1">
                LIVE CONTENT
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(liveHash, "live")}
                title="Click to copy hash"
                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-bg border border-border hover:border-fg/40 font-mono text-xs text-fg tracking-normal transition-colors cursor-pointer"
              >
                <span>{liveHash}</span>
                {copiedField === "live" ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-fg-muted group-hover:text-fg transition-colors opacity-50 group-hover:opacity-100" />
                )}
              </button>
            </div>

            {/* Saved Content Hash */}
            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-fg-muted font-medium mb-1">
                SAVED CONTENT
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(savedHash, "saved")}
                title="Click to copy hash"
                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-bg border border-border hover:border-fg/40 font-mono text-xs text-fg tracking-normal transition-colors cursor-pointer"
              >
                <span>{savedHash}</span>
                {copiedField === "saved" ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-fg-muted group-hover:text-fg transition-colors opacity-50 group-hover:opacity-100" />
                )}
              </button>
            </div>
          </div>

          {/* Status info & commit details */}
          {status?.commitSha && (
            <div className="text-right text-[11px] font-mono text-fg-muted flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
              <span className="flex items-center gap-1">
                <GitCommit className="w-3 h-3" />
                <span>Target commit: </span>
                {status.commitUrl ? (
                  <a
                    href={status.commitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fg hover:underline font-semibold"
                  >
                    {status.commitSha.slice(0, 7)}
                  </a>
                ) : (
                  <span className="font-semibold text-fg">{status.commitSha.slice(0, 7)}</span>
                )}
              </span>
              {status.lastPublishedAt && (
                <span className="flex items-center gap-1 text-[10px] text-fg-subtle">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{new Date(status.lastPublishedAt).toLocaleTimeString()}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      <Modal open={showPublishModal} onOpenChange={setShowPublishModal}>
        <ModalContent
          title="Publish Saved Content to Live Website"
          description="Are you sure you want to deploy the latest saved content?"
        >
          <div className="p-5 space-y-4 text-xs font-sans text-fg">
            <p className="text-fg-muted leading-relaxed">
              This action will snapshot your current saved database content and commit it to the
              <code className="mx-1 px-1.5 py-0.5 rounded bg-bg font-mono border border-border">main</code>
              branch on GitHub. Vercel will automatically build and deploy the update to:
            </p>

            <div className="p-3 rounded-[6px] bg-bg border border-border font-mono text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-fg-muted">Target URL:</span>
                <span className="text-fg font-semibold">https://jeptahzrepo.vercel.app</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-muted">Content SHA-256:</span>
                <span className="text-fg font-semibold">{savedHash}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPublishModal(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isPublishingAction}
                className="cursor-pointer"
              >
                {isPublishingAction ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Publishing…
                  </>
                ) : (
                  "Confirm & Publish"
                )}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      {/* Revert Confirmation Modal */}
      <Modal open={showRevertModal} onOpenChange={setShowRevertModal}>
        <ModalContent
          title="Revert to Previous Published Snapshot"
          description="Restore the live site to the previously published version."
        >
          <div className="p-5 space-y-4 text-xs font-sans text-fg">
            <p className="text-fg-muted leading-relaxed">
              This action creates a new forward commit that restores the archive file to the snapshot from
              the previous publish. Git history is preserved.
            </p>

            {previousSnapshot && (
              <div className="p-3 rounded-[6px] bg-bg border border-border font-mono text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-fg-muted">Target Commit:</span>
                  <span className="text-fg font-semibold">{previousSnapshot.shortSha}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-muted">Commit Message:</span>
                  <span className="text-fg truncate max-w-[200px]">{previousSnapshot.message}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-muted">Date:</span>
                  <span className="text-fg">{new Date(previousSnapshot.date).toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRevertModal(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleRevert}
                disabled={isRevertingAction}
                className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                {isRevertingAction ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Reverting…
                  </>
                ) : (
                  "Confirm Revert"
                )}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
