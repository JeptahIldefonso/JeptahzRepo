export interface VercelConfig {
  token: string | null;
  projectId: string | null;
  teamId: string | null;
}

export interface DeploymentStatus {
  found: boolean;
  state: "QUEUED" | "BUILDING" | "INITIALIZING" | "READY" | "ERROR" | "CANCELED" | "UNKNOWN";
  url: string | null;
  deploymentId: string | null;
  createdAt: number | null;
  errorMessage?: string;
}

export function getVercelConfig(): VercelConfig {
  return {
    token: process.env.VERCEL_TOKEN?.trim() || null,
    projectId: process.env.VERCEL_PROJECT_ID?.trim() || process.env.PROJECT_ID?.trim() || "jeptahzrepo",
    teamId: process.env.VERCEL_TEAM_ID?.trim() || process.env.TEAM_ID?.trim() || null,
  };
}

/**
 * Checks Vercel Deployments API for a deployment matching the given GitHub commit SHA.
 */
export async function getDeploymentForCommit(commitSha: string): Promise<DeploymentStatus> {
  const config = getVercelConfig();

  if (!config.token) {
    // If no Vercel token, we cannot poll Vercel API directly
    return {
      found: false,
      state: "UNKNOWN",
      url: "https://jeptahzrepo.vercel.app",
      deploymentId: null,
      createdAt: null,
    };
  }

  const queryParams = new URLSearchParams();
  if (config.projectId) queryParams.set("projectId", config.projectId);
  if (config.teamId) queryParams.set("teamId", config.teamId);
  queryParams.set("limit", "15");

  const url = `https://api.vercel.com/v6/deployments?${queryParams.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        "User-Agent": "JeptahzRepo-Admin/1.0",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[vercel] API returned status ${res.status}: ${res.statusText}`);
      return {
        found: false,
        state: "UNKNOWN",
        url: null,
        deploymentId: null,
        createdAt: null,
      };
    }

    const data = (await res.json()) as {
      deployments?: Array<{
        uid: string;
        name: string;
        url: string;
        readyState: string;
        createdAt: number;
        meta?: {
          githubCommitSha?: string;
          gitCommitSha?: string;
        };
      }>;
    };

    if (!data.deployments || data.deployments.length === 0) {
      return {
        found: false,
        state: "QUEUED",
        url: null,
        deploymentId: null,
        createdAt: null,
      };
    }

    // Find the deployment with the exact commit SHA
    const match = data.deployments.find((d) => {
      const sha = d.meta?.githubCommitSha || d.meta?.gitCommitSha;
      return sha && sha.toLowerCase() === commitSha.toLowerCase();
    });

    if (match) {
      const validState = match.readyState.toUpperCase();
      let state: DeploymentStatus["state"] = "UNKNOWN";

      if (["READY", "BUILDING", "INITIALIZING", "QUEUED", "ERROR", "CANCELED"].includes(validState)) {
        state = validState as DeploymentStatus["state"];
      }

      return {
        found: true,
        state,
        url: match.url ? `https://${match.url}` : null,
        deploymentId: match.uid,
        createdAt: match.createdAt,
      };
    }

    // Commit might still be queuing in Vercel CI
    return {
      found: false,
      state: "QUEUED",
      url: null,
      deploymentId: null,
      createdAt: null,
    };
  } catch (err) {
    console.warn("[vercel] Failed to fetch deployment status:", err);
    return {
      found: false,
      state: "UNKNOWN",
      url: null,
      deploymentId: null,
      createdAt: null,
    };
  }
}
