import { NextRequest, NextResponse } from "next/server";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { requireRole } from "@/lib/rbac";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".msi",
  ".vbs",
  ".pif",
  ".com",
  ".scr",
  ".gadget",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit (Blueprint Section 12.3)

/**
 * Admin Upload Route (Blueprint Section 12 & 15)
 * Requires editor role.
 * Validates file size, validates extension, uploads to Firebase Storage or local fallback.
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole("editor");
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const altText = (formData.get("alt") as string | null) || "";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const originalName = file.name || "upload";
    const rawExt = path.extname(originalName).toLowerCase();

    if (BLOCKED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { success: false, error: `Executable file type "${rawExt}" is restricted.` },
        { status: 400 }
      );
    }

    const safeExt = rawExt && /^\.[a-z0-9_-]{1,12}$/i.test(rawExt) ? rawExt : "";
    const randomId = crypto.randomUUID();
    const secureFileName = safeExt ? `${randomId}${safeExt}` : `${randomId}.bin`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Firebase Storage upload
    const { bucket } = getFirebaseAdmin();
    if (bucket) {
      try {
        const fileRef = bucket.file(`uploads/${secureFileName}`);
        await fileRef.save(buffer, {
          metadata: {
            contentType: file.type || "application/octet-stream",
            metadata: { alt: altText },
          },
          public: true,
        });

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${secureFileName}`;

        return NextResponse.json({
          success: true,
          url: publicUrl,
          filename: secureFileName,
          originalName: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          alt: altText,
          storage: "firebase",
        });
      } catch (err: unknown) {
        console.warn("[firebase_storage_upload_fallback]", err);
      }
    }

    // 2. Local disk fallback
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, secureFileName);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `/uploads/${secureFileName}`;
    return NextResponse.json({
      success: true,
      url: localUrl,
      filename: secureFileName,
      originalName: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      alt: altText,
      storage: "local",
    });
  } catch (error: unknown) {
    console.error("[admin_upload_error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process upload",
      },
      { status: 500 }
    );
  }
}
