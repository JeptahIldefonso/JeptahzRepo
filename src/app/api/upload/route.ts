import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/avif", ".avif"],
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    // Secondary in-handler authentication check
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isAuthed = await verifySessionToken(token);
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin session required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // 1. File size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds 5MB limit",
        },
        { status: 400 }
      );
    }

    // 2. MIME type allowlist (rejects SVGs, executables, HTML, etc.)
    const extension = ALLOWED_MIME_TYPES.get(file.type.toLowerCase());
    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Allowed formats: JPEG, PNG, WebP, GIF, AVIF",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Unpredictable random filename (prevents file overwrite and path traversal)
    const randomId = crypto.randomUUID();
    const secureFileName = `${randomId}${extension}`;

    // 4. Try Supabase Storage if configured
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project")) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase.storage
        .from("archive-assets")
        .upload(`uploads/${secureFileName}`, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (!error && data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("archive-assets").getPublicUrl(data.path);

        return NextResponse.json({
          success: true,
          url: publicUrl,
          filename: secureFileName,
          storage: "supabase",
        });
      }
    }

    // 5. Local fallback storage (public/uploads/)
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
      storage: "local",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process upload" },
      { status: 500 }
    );
  }
}
