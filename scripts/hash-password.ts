/**
 * Generates the argon2id hash for ADMIN_PASSWORD_HASH and writes it safely to .env.local.
 *
 *   npx tsx scripts/hash-password.ts
 *
 * Reads from stdin rather than argv, so the password stays out of shell history
 * and process listings, and echoes nothing as you type.
 */

import { hash } from "@node-rs/argon2";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { readSecret } from "./read-secret";

async function main() {
  const password = await readSecret("Enter new admin password (hidden as you type): ");

  if (password.length < 8) {
    process.stderr.write(
      "\n\x1b[31m✖ Too short.\x1b[0m Use at least 8 characters.\n\n"
    );
    process.exit(1);
  }

  const fingerprint = createHash("sha256").update(password, "utf8").digest("hex").slice(0, 12);

  // OWASP-recommended argon2id parameters
  const digest = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    process.stdout.write(
      `\nNo .env.local found. Add this line to it:\n\n` +
        `ADMIN_PASSWORD_HASH=${digest.replaceAll("$", "\\$")}\n\n`
    );
    process.exit(0);
  }

  const existing = readFileSync(envPath, "utf8");
  const assignment = /^ADMIN_PASSWORD_HASH=.*\r?$/m;
  const eol = existing.includes("\r\n") ? "\r\n" : "\n";
  const line = `ADMIN_PASSWORD_HASH=${digest.replaceAll("$", "\\$")}`;

  const updated = assignment.test(existing)
    ? existing.replace(assignment, line)
    : existing.trimEnd() + `${eol}${line}${eol}`;

  writeFileSync(envPath, updated, "utf8");

  process.stdout.write(
    `\n\x1b[32m✔\x1b[0m Wrote ADMIN_PASSWORD_HASH to .env.local\n\n` +
      `  Password length: ${password.length}, SHA-256 fingerprint: ${fingerprint}\n` +
      `  Restart your dev server (npm run dev) so Next.js reloads .env.local.\n` +
      `  For Vercel production, copy ADMIN_PASSWORD_HASH into your Vercel Project Settings.\n\n`
  );
}

main().catch((err) => {
  console.error("\nError generating password hash:", err);
  process.exit(1);
});
