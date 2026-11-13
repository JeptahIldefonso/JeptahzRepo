import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeContentHash, canonicalSerialize } from "./hash";
import { sanitizeError } from "./sanitize";

describe("Deterministic Content Hashing & Serialization", () => {
  it("produces identical JSON output regardless of object key order", () => {
    const objA = { z: 1, a: "hello", m: { y: 2, b: 3 } };
    const objB = { a: "hello", m: { b: 3, y: 2 }, z: 1 };

    const jsonA = canonicalSerialize(objA);
    const jsonB = canonicalSerialize(objB);

    assert.equal(jsonA, jsonB);
    assert.match(jsonA, /\n$/); // trailing newline
  });

  it("computes identical 12-character SHA-256 hashes for reordered objects", () => {
    const data1 = {
      site_settings: { title: "JeptahzRepo", theme: "dark" },
      apps: [{ id: "app-1", name: "Alpha" }, { id: "app-2", name: "Beta" }],
    };

    const data2 = {
      apps: [{ name: "Alpha", id: "app-1" }, { id: "app-2", name: "Beta" }],
      site_settings: { theme: "dark", title: "JeptahzRepo" },
    };

    const hash1 = computeContentHash(data1);
    const hash2 = computeContentHash(data2);

    assert.equal(hash1.length, 12);
    assert.equal(hash2.length, 12);
    assert.equal(hash1, hash2);
    assert.match(hash1, /^[0-9a-f]{12}$/);
  });

  it("changes hash when content changes", () => {
    const original = { title: "JeptahzRepo", version: 1 };
    const updated = { title: "JeptahzRepo", version: 2 };

    const hashOriginal = computeContentHash(original);
    const hashUpdated = computeContentHash(updated);

    assert.notEqual(hashOriginal, hashUpdated);
  });
});

describe("Secret Redaction (sanitizeError)", () => {
  it("redacts classic GitHub tokens (ghp_*)", () => {
    const raw = "Error: Authentication failed with token ghp_1234567890abcdefghijklmnopqrstuvwxyz12";
    const cleaned = sanitizeError(raw);
    assert.equal(cleaned.includes("ghp_1234567890abcdefghijklmnopqrstuvwxyz12"), false);
    assert.match(cleaned, /\[REDACTED_TOKEN\]/);
  });

  it("redacts fine-grained GitHub tokens (github_pat_*)", () => {
    const raw = "Request failed: github_pat_11AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRRSSTTUUVVWWXXYYZZ_1234567890abcdef";
    const cleaned = sanitizeError(raw);
    assert.equal(cleaned.includes("github_pat_"), false);
    assert.match(cleaned, /\[REDACTED_TOKEN\]/);
  });

  it("redacts Bearer authorization headers", () => {
    const raw = "Failed to fetch https://api.vercel.com with Authorization: Bearer vercel_secret_token_abc123";
    const cleaned = sanitizeError(raw);
    assert.equal(cleaned.includes("vercel_secret_token_abc123"), false);
    assert.match(cleaned, /Bearer \[REDACTED\]/);
  });

  it("handles Error objects and primitive strings", () => {
    const err = new Error("Connection failed with Bearer my_secret_jwt_token");
    const cleaned = sanitizeError(err);
    assert.equal(cleaned.includes("my_secret_jwt_token"), false);
    assert.match(cleaned, /Bearer \[REDACTED\]/);
  });
});

describe("Vercel Commit Matching Logic", () => {
  it("matches target commit SHA case-insensitively from meta.githubCommitSha", () => {
    const targetSha = "52a245fe3981aa784c0ea7cfae8d6ba331223334";
    const deployments = [
      {
        uid: "dpl_1",
        readyState: "READY",
        url: "jeptahzrepo-old.vercel.app",
        meta: { githubCommitSha: "1111111111111111111111111111111111111111" },
      },
      {
        uid: "dpl_2",
        readyState: "READY",
        url: "jeptahzrepo-match.vercel.app",
        meta: { githubCommitSha: "52A245FE3981AA784C0EA7CFAE8D6BA331223334" },
      },
    ];

    const match = deployments.find((d) => {
      const sha = d.meta?.githubCommitSha;
      return sha && sha.toLowerCase() === targetSha.toLowerCase();
    });

    assert.ok(match);
    assert.equal(match.uid, "dpl_2");
    assert.equal(match.url, "jeptahzrepo-match.vercel.app");
  });

  it("falls back to gitCommitSha if githubCommitSha is absent", () => {
    const targetSha = "abcdef1234567890abcdef1234567890abcdef12";
    interface TestDeployment {
      uid: string;
      readyState: string;
      url: string;
      meta?: { githubCommitSha?: string; gitCommitSha?: string };
    }
    const deployments: TestDeployment[] = [
      {
        uid: "dpl_3",
        readyState: "READY",
        url: "jeptahzrepo-fallback.vercel.app",
        meta: { gitCommitSha: targetSha },
      },
    ];

    const match = deployments.find((d) => {
      const sha = d.meta?.githubCommitSha || d.meta?.gitCommitSha;
      return sha && sha.toLowerCase() === targetSha.toLowerCase();
    });

    assert.ok(match);
    assert.equal(match.uid, "dpl_3");
  });
});

describe("Stale Lock Expiration Logic", () => {
  const TIMEOUT_MS = 10 * 60 * 1000;

  function isLockStale(lockedAt: number | null, now: number): boolean {
    if (!lockedAt) return false;
    return now - lockedAt > TIMEOUT_MS;
  }

  it("identifies a lock as active within 10 minutes", () => {
    const lockedAt = 1000000;
    const now = lockedAt + 5 * 60 * 1000; // 5 min later
    assert.equal(isLockStale(lockedAt, now), false);
  });

  it("identifies a lock as stale when older than 10 minutes", () => {
    const lockedAt = 1000000;
    const now = lockedAt + 11 * 60 * 1000; // 11 min later
    assert.equal(isLockStale(lockedAt, now), true);
  });
});
