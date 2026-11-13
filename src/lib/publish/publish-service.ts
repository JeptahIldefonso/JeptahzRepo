import fs from "fs";
import path from "path";
import {
  getApps,
  getEntries,
  getTopics,
  getSiteSettings,
  getChangelogItems,
} from "@/db/data-provider";
import { computeContentHash, canonicalSerialize } from "./hash";
import {
  fetchRemoteArchive,
  fetchPublishHistory,
  fetchArchiveAtCommit,
  commitArchiveToGitHub,
  getGitHubConfig,
  PublishCommitInfo,
} from "./github";
import { getDeploymentForCommit, getVercelConfig } from "./vercel";
import { sanitizeError } from "./sanitize";

export interface PublishStatusDetail {
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
  history: PublishCommitInfo[];
  isConfigured: {
    github: boolean;
    vercel: boolean;
  };
  statusMessage: string;
}

interface ActiveLockState {
  isLocked: boolean;
  lockedAt: number | null;
  commitSha: string | null;
  commitUrl: string | null;
  targetHash: string | null;
  lastError: string | null;
  lastDeploymentUrl: string | null;
  lastPublishedAt: string | null;
}

const PUBLISH_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

// In-memory process lock (persists across requests within the server runtime)
const lockState: ActiveLockState = {
  isLocked: false,
  lockedAt: null,
  commitSha: null,
  commitUrl: null,
  targetHash: null,
  lastError: null,
  lastDeploymentUrl: null,
  lastPublishedAt: null,
};

/**
 * Compiles the complete current saved database state into a canonical snapshot.
 */
export async function getSavedArchiveSnapshot() {
  const [apps, entries, topics, siteSettings, changelogItems] = await Promise.all([
    getApps(),
    getEntries({ includeUnpublished: true }),
    getTopics(),
    getSiteSettings(),
    getChangelogItems(),
  ]);

  return {
    apps,
    entries,
    topics,
    site_settings: siteSettings,
    changelog_items: changelogItems,
  };
}

/**
 * Retrieves the comprehensive publish and deployment status.
 */
export async function getPublishStatus(): Promise<PublishStatusDetail> {
  const ghConfig = getGitHubConfig();
  const vConfig = getVercelConfig();

  // 1. Compute Saved Hash from current DB
  const savedData = await getSavedArchiveSnapshot();
  const savedHash = computeContentHash(savedData);

  // 2. Fetch Remote Live Content from GitHub main
  const remote = await fetchRemoteArchive();
  const liveHash = computeContentHash(remote.parsedData);

  // 3. Check and clean up lock if timed out
  const now = Date.now();
  if (lockState.isLocked && lockState.lockedAt && now - lockState.lockedAt > PUBLISH_TIMEOUT_MS) {
    lockState.isLocked = false;
    lockState.lastError = "Deployment polling timed out after 10 minutes. Please check Vercel dashboard.";
  }

  // 4. If currently locked in publishing, poll Vercel deployment status
  let currentState: PublishStatusDetail["state"] = "idle";
  let statusMessage = "Unpublished changes waiting to be deployed.";

  if (lockState.isLocked && lockState.commitSha) {
    if (!vConfig.token) {
      // Local dev or environment without VERCEL_TOKEN: commit succeeded, skip deployment polling
      lockState.isLocked = false;
      lockState.lastError = null;
      lockState.lastDeploymentUrl = "https://jeptahzrepo.vercel.app";
      lockState.lastPublishedAt = new Date().toISOString();
      currentState = "ready";
      statusMessage = "Committed to GitHub. Live deployment tracking skipped (VERCEL_TOKEN not configured).";
    } else {
      currentState = "publishing";
      statusMessage = "Publishing to Vercel... Polling build status.";

      const deployment = await getDeploymentForCommit(lockState.commitSha);

      if (deployment.found) {
        if (deployment.state === "READY") {
          lockState.isLocked = false;
          lockState.lastError = null;
          lockState.lastDeploymentUrl = deployment.url || "https://jeptahzrepo.vercel.app";
          lockState.lastPublishedAt = new Date().toISOString();
          currentState = "ready";
          statusMessage = "Live and up to date.";
        } else if (deployment.state === "ERROR" || deployment.state === "CANCELED") {
          lockState.isLocked = false;
          lockState.lastError = `Vercel build ${deployment.state.toLowerCase()}. Check Vercel logs for build details.`;
          currentState = "error";
          statusMessage = "Publish failed.";
        }
      }
    }
  } else if (lockState.lastError) {
    currentState = "error";
    statusMessage = lockState.lastError;
  } else if (savedHash === liveHash) {
    currentState = "ready";
    statusMessage = "The live site matches your saved content.";
  }

  // 5. Fetch commit history for Revert support
  let history: PublishCommitInfo[] = [];
  try {
    history = await fetchPublishHistory(10);
  } catch {
    history = [];
  }

  const isPublishEnabled = process.env.PUBLISH_ENABLED !== "false";
  const isUpToDate = savedHash === liveHash;
  const canPublish = isPublishEnabled && !isUpToDate && currentState !== "publishing";
  const canRevert = isPublishEnabled && history.length > 1 && currentState !== "publishing";

  if (!isPublishEnabled && currentState !== "publishing") {
    statusMessage = "Publishing is disabled in this environment (set PUBLISH_ENABLED=true).";
  }

  return {
    state: currentState,
    liveHash,
    savedHash,
    isUpToDate,
    canPublish,
    canRevert,
    lastPublishedAt: lockState.lastPublishedAt,
    deploymentUrl: lockState.lastDeploymentUrl || (currentState === "ready" ? "https://jeptahzrepo.vercel.app" : null),
    commitSha: lockState.commitSha,
    commitUrl: lockState.commitUrl,
    error: lockState.lastError,
    history,
    isConfigured: {
      github: Boolean(ghConfig.token),
      vercel: Boolean(vConfig.token),
    },
    statusMessage,
  };
}

/**
 * Triggers a live publish:
 * - Snapshots current database content.
 * - Commits mock-archive.json to GitHub main branch.
 * - Starts tracking Vercel deployment.
 */
export async function executePublish(): Promise<{
  success: boolean;
  commitSha: string;
  commitUrl: string;
  hash: string;
}> {
  // Clear stale lock if older than timeout
  if (lockState.isLocked && lockState.lockedAt && Date.now() - lockState.lockedAt > PUBLISH_TIMEOUT_MS) {
    lockState.isLocked = false;
  }

  if (lockState.isLocked) {
    throw new Error("A publish operation is already in progress. Please wait for it to complete.");
  }

  if (process.env.PUBLISH_ENABLED === "false") {
    throw new Error("Publishing is disabled in this environment (PUBLISH_ENABLED is false).");
  }

  const ghConfig = getGitHubConfig();
  if (!ghConfig.token) {
    throw new Error(
      "GITHUB_TOKEN is not configured. Please add GITHUB_TOKEN to your environment variables (Settings > Environment Variables in Vercel) with Contents: Read and write permissions."
    );
  }

  // Acquire lock
  lockState.isLocked = true;
  lockState.lockedAt = Date.now();
  lockState.lastError = null;

  try {
    const savedData = await getSavedArchiveSnapshot();
    const canonicalJson = canonicalSerialize(savedData);
    const savedHash = computeContentHash(savedData);

    // Fetch remote to get the latest blob SHA and check whether up to date
    const remote = await fetchRemoteArchive();
    const liveHash = computeContentHash(remote.parsedData);

    if (savedHash === liveHash) {
      lockState.isLocked = false;
      throw new Error("Content is already up to date. Nothing to publish.");
    }

    const commitMessage = `chore(publish): deploy live content snapshot [${savedHash}]`;
    const { commitSha, commitUrl } = await commitArchiveToGitHub({
      contentJson: canonicalJson,
      previousBlobSha: remote.blobSha,
      message: commitMessage,
    });

    lockState.commitSha = commitSha;
    lockState.commitUrl = commitUrl;
    lockState.targetHash = savedHash;

    // Also persist locally if running in local environment
    try {
      const localPath = path.join(process.cwd(), "src", "db", "seeds", "mock-archive.json");
      if (fs.existsSync(localPath)) {
        fs.writeFileSync(localPath, canonicalJson, "utf-8");
      }
    } catch {
      // Non-blocking in serverless environments
    }

    return {
      success: true,
      commitSha,
      commitUrl,
      hash: savedHash,
    };
  } catch (err: unknown) {
    lockState.isLocked = false;
    const msg = sanitizeError(err);
    lockState.lastError = msg;
    throw new Error(msg);
  }
}

/**
 * Reverts the live site to the previous published snapshot.
 * Creates a new forward commit containing the previous snapshot.json so git history is never rewritten.
 */
export async function executeRevert(): Promise<{
  success: boolean;
  commitSha: string;
  commitUrl: string;
  revertedToHash: string;
}> {
  // Clear stale lock if older than timeout
  if (lockState.isLocked && lockState.lockedAt && Date.now() - lockState.lockedAt > PUBLISH_TIMEOUT_MS) {
    lockState.isLocked = false;
  }

  if (lockState.isLocked) {
    throw new Error("A publish or revert operation is already in progress. Please wait.");
  }

  if (process.env.PUBLISH_ENABLED === "false") {
    throw new Error("Publishing is disabled in this environment (PUBLISH_ENABLED is false).");
  }

  const ghConfig = getGitHubConfig();
  if (!ghConfig.token) {
    throw new Error("GITHUB_TOKEN is required to execute a revert.");
  }

  lockState.isLocked = true;
  lockState.lockedAt = Date.now();
  lockState.lastError = null;

  try {
    const history = await fetchPublishHistory(10);
    if (history.length < 2) {
      throw new Error("No previous published snapshot found in commit history to revert to.");
    }

    const previousCommit = history[1];
    const previousSnapshot = await fetchArchiveAtCommit(previousCommit.sha);
    if (!previousSnapshot) {
      throw new Error(`Failed to retrieve archive from previous commit ${previousCommit.shortSha}.`);
    }

    const canonicalJson = canonicalSerialize(previousSnapshot.parsedData);
    const restoredHash = computeContentHash(previousSnapshot.parsedData);

    const remote = await fetchRemoteArchive();

    const commitMessage = `chore(revert): restore published snapshot from ${previousCommit.shortSha} [${restoredHash}]`;
    const { commitSha, commitUrl } = await commitArchiveToGitHub({
      contentJson: canonicalJson,
      previousBlobSha: remote.blobSha,
      message: commitMessage,
    });

    lockState.commitSha = commitSha;
    lockState.commitUrl = commitUrl;
    lockState.targetHash = restoredHash;

    // Also update local file if present
    try {
      const localPath = path.join(process.cwd(), "src", "db", "seeds", "mock-archive.json");
      if (fs.existsSync(localPath)) {
        fs.writeFileSync(localPath, canonicalJson, "utf-8");
      }
    } catch {
      // Non-blocking
    }

    return {
      success: true,
      commitSha,
      commitUrl,
      revertedToHash: restoredHash,
    };
  } catch (err: unknown) {
    lockState.isLocked = false;
    const msg = sanitizeError(err);
    lockState.lastError = msg;
    throw new Error(msg);
  }
}
