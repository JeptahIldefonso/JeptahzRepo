import crypto from "crypto";

/**
 * Recursively sort keys in any object / array structure so that key insertion order
 * does not affect JSON serialization or hash generation.
 */
export function sortKeysRecursively(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sortKeysRecursively);
  }

  const record = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(record).sort();

  for (const key of keys) {
    sorted[key] = sortKeysRecursively(record[key]);
  }

  return sorted;
}

/**
 * Serializes any content snapshot into a deterministic, canonical JSON string with
 * sorted keys, standard 2-space indentation, and a trailing newline.
 */
export function canonicalSerialize(data: unknown): string {
  const sorted = sortKeysRecursively(data);
  return JSON.stringify(sorted, null, 2) + "\n";
}

/**
 * Computes a deterministic 12-character SHA-256 hash of any content snapshot.
 */
export function computeContentHash(data: unknown): string {
  const canonical = canonicalSerialize(data);
  return crypto.createHash("sha256").update(canonical, "utf-8").digest("hex").slice(0, 12);
}
