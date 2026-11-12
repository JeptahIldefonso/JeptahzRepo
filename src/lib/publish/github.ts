import fs from "fs";
import path from "path";

export interface GitHubConfig {
  token: string | null;
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
}

export interface PublishCommitInfo {
  sha: string;
  shortSha: string;
  message: string;
  date: string;
  author: string;
  url: string;
}

export function getGitHubConfig(): GitHubConfig {
  return {
    token: process.env.GITHUB_TOKEN?.trim() || null,
    owner: process.env.GITHUB_OWNER?.trim() || "JeptahIldefonso",
    repo: process.env.GITHUB_REPO?.trim() || "JeptahzRepo",
    branch: process.env.GITHUB_BRANCH?.trim() || "main",
    filePath: "src/db/seeds/mock-archive.json",
  };
}

/**
 * Reads the local fallback mock-archive.json if GitHub is unavailable or unconfigured.
 */
export function readLocalSeedArchive(): { contentJson: string; parsedData: unknown } {
  try {
    const localPath = path.join(process.cwd(), "src", "db", "seeds", "mock-archive.json");
    if (fs.existsSync(localPath)) {
      const contentJson = fs.readFileSync(localPath, "utf-8");
      return {
        contentJson,
        parsedData: JSON.parse(contentJson),
      };
    }
  } catch (err) {
    console.warn("[github] Failed to read local mock-archive.json:", err);
  }

  return {
    contentJson: "{}",
    parsedData: {},
  };
}

/**
 * Fetches the live mock-archive.json file from the GitHub repository's main branch.
 */
export async function fetchRemoteArchive(): Promise<{
  contentJson: string;
  parsedData: unknown;
  blobSha: string | null;
  isRemote: boolean;
}> {
  const config = getGitHubConfig();

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "JeptahzRepo-Admin/1.0",
  };

  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }

  const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${config.branch}`;

  try {
    const res = await fetch(apiUrl, {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as { content?: string; encoding?: string; sha?: string };
      if (data.content) {
        const rawString = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
        const parsed = JSON.parse(rawString);
        return {
          contentJson: rawString,
          parsedData: parsed,
          blobSha: data.sha || null,
          isRemote: true,
        };
      }
    } else {
      console.warn(`[github] GitHub API returned status ${res.status}: ${res.statusText}`);
    }
  } catch (err) {
    console.warn("[github] Network error fetching from GitHub API, attempting raw fallback:", err);
  }

  // Fallback 1: Raw GitHub UserContent (for public repo without auth)
  try {
    const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.filePath}`;
    const rawRes = await fetch(rawUrl, { cache: "no-store" });
    if (rawRes.ok) {
      const text = await rawRes.text();
      const parsed = JSON.parse(text);
      return {
        contentJson: text,
        parsedData: parsed,
        blobSha: null,
        isRemote: true,
      };
    }
  } catch (rawErr) {
    console.warn("[github] Raw GitHub fallback failed:", rawErr);
  }

  // Fallback 2: Local filesystem seed file
  const local = readLocalSeedArchive();
  return {
    contentJson: local.contentJson,
    parsedData: local.parsedData,
    blobSha: null,
    isRemote: false,
  };
}

/**
 * Fetches the mock-archive.json file at a specific commit hash for revert.
 */
export async function fetchArchiveAtCommit(commitSha: string): Promise<{
  contentJson: string;
  parsedData: unknown;
} | null> {
  const config = getGitHubConfig();

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "JeptahzRepo-Admin/1.0",
  };

  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }

  const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${commitSha}`;

  try {
    const res = await fetch(apiUrl, { headers, cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { content?: string };
      if (data.content) {
        const rawString = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
        return {
          contentJson: rawString,
          parsedData: JSON.parse(rawString),
        };
      }
    }
  } catch (err) {
    console.error(`[github] Failed to fetch archive at commit ${commitSha}:`, err);
  }

  return null;
}

/**
 * Fetches the recent commit history for mock-archive.json to enable Revert functionality.
 */
export async function fetchPublishHistory(limit = 10): Promise<PublishCommitInfo[]> {
  const config = getGitHubConfig();

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "JeptahzRepo-Admin/1.0",
  };

  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }

  const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/commits?path=${config.filePath}&sha=${config.branch}&per_page=${limit}`;

  try {
    const res = await fetch(apiUrl, { headers, cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as Array<{
        sha: string;
        commit: {
          message: string;
          author?: { name?: string; date?: string };
        };
        html_url: string;
      }>;

      return data.map((item) => ({
        sha: item.sha,
        shortSha: item.sha.slice(0, 7),
        message: item.commit.message.split("\n")[0] || "Update archive",
        date: item.commit.author?.date || new Date().toISOString(),
        author: item.commit.author?.name || "System",
        url: item.html_url,
      }));
    }
  } catch (err) {
    console.warn("[github] Failed to fetch commit history:", err);
  }

  return [];
}

/**
 * Commits updated canonical JSON content for mock-archive.json to GitHub.
 * Returns the created commit SHA and URL.
 */
export async function commitArchiveToGitHub({
  contentJson,
  previousBlobSha,
  message,
}: {
  contentJson: string;
  previousBlobSha?: string | null;
  message: string;
}): Promise<{ commitSha: string; commitUrl: string }> {
  const config = getGitHubConfig();

  if (!config.token) {
    throw new Error(
      "Missing GITHUB_TOKEN environment variable. Please configure GITHUB_TOKEN to enable live publishing."
    );
  }

  const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`;

  // If previousBlobSha wasn't provided, fetch it first so GitHub doesn't reject with 409 Conflict
  let currentSha = previousBlobSha;
  if (!currentSha) {
    const remote = await fetchRemoteArchive();
    currentSha = remote.blobSha;
  }

  const base64Content = Buffer.from(contentJson, "utf-8").toString("base64");

  const payload: Record<string, unknown> = {
    message,
    content: base64Content,
    branch: config.branch,
  };

  if (currentSha) {
    payload.sha = currentSha;
  }

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "JeptahzRepo-Admin/1.0",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`GitHub commit failed with status ${res.status}: ${errorBody}`);
  }

  const data = (await res.json()) as {
    commit: { sha: string; html_url: string };
  };

  return {
    commitSha: data.commit.sha,
    commitUrl: data.commit.html_url,
  };
}
