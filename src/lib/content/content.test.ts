import test from "node:test";
import assert from "node:assert/strict";
import {
  siteContentSchema,
  emptyContent,
  appPublicSchema,
  entryPublicSchema,
} from "./schema";
import { inquiryInputSchema } from "@/lib/validators/inquiry";

test("Universal Content Contract - schema validation", async (t) => {
  await t.test("validates emptyContent correctly", () => {
    const parsed = siteContentSchema.parse(emptyContent);
    assert.equal(parsed.version, 0);
    assert.deepEqual(parsed.apps, []);
    assert.deepEqual(parsed.entries, []);
    assert.equal(parsed.site_settings.site_title, "JeptahzRepo");
  });

  await t.test("appPublicSchema accepts valid app metadata", () => {
    const validApp = {
      id: "app-123",
      title: "Test Desktop Application",
      slug: "test-desktop-app",
      tagline: "High-performance software",
      description: "A desktop utility built with Rust and React.",
      version: "v1.2.0",
      badge: "Active",
      category: "Desktop App",
      carousel_images: [{ url: "https://example.com/img1.png", caption: "Main window" }],
      tech_stack: ["Rust", "TypeScript"],
      sort_order: 1,
      is_featured: true,
    };

    const parsed = appPublicSchema.parse(validApp);
    assert.equal(parsed.title, "Test Desktop Application");
    assert.equal(parsed.is_featured, true);
    assert.equal(parsed.version, "v1.2.0");
  });

  await t.test("entryPublicSchema handles documents and code projects", () => {
    const validDoc = {
      id: "doc-456",
      title: "Algorithms & Complexity",
      slug: "algorithms-complexity",
      type: "doc" as const,
      summary: "Study notes on asymptotic bounds and dynamic programming.",
      content: "# Dynamic Programming\n\nMemoization vs Tabulation...",
      tags: ["Algorithms", "Complexity"],
      is_published: true,
      sort_order: 0,
    };

    const parsed = entryPublicSchema.parse(validDoc);
    assert.equal(parsed.type, "doc");
    assert.equal(parsed.slug, "algorithms-complexity");
    assert.equal(parsed.is_published, true);
  });
});

test("Inquiry Validation Contract (Blueprint Section 14)", async (t) => {
  await t.test("accepts valid contact form submission", () => {
    const input = {
      name: "Ada Lovelace",
      email: "ada@analytical-engine.org",
      company: "Independent Research",
      message: "I would like to collaborate on the theoretical computing notes.",
    };

    const result = inquiryInputSchema.safeParse(input);
    assert.equal(result.success, true);
  });

  await t.test("detects honeypot field submission from automated bots", () => {
    const botInput = {
      name: "Spam Bot",
      email: "bot@spam-network.ru",
      message: "Buy cheap backlinks now!",
      website: "http://spam-link.biz",
    };

    const result = inquiryInputSchema.safeParse(botInput);
    assert.equal(result.success, true);
    assert.equal(result.data?.website, "http://spam-link.biz");
  });

  await t.test("rejects invalid email address and empty message", () => {
    const invalidInput = {
      name: "User",
      email: "not-an-email",
      message: "",
    };

    const result = inquiryInputSchema.safeParse(invalidInput);
    assert.equal(result.success, false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      assert.ok(errors.email);
      assert.ok(errors.message);
    }
  });
});
