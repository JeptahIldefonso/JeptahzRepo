import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

// Dangerous executable formats blocked for security
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

// Maximum file size supported by Vercel serverless request body
const MAX_FILE_SIZE_BYTES = Math.floor(4.5 * 1024 * 1024); // 4.5 MB

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
          error: "File size exceeds 4.5MB limit",
        },
        { status: 400 }
      );
    }

    // 2. Extension validation (Allows MD, CSV, PDF, TXT, DOCX, Code, Images, Audio/Video, etc.)
    const originalName = file.name || "upload";
    const rawExt = path.extname(originalName).toLowerCase();
    if (BLOCKED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        {
          success: false,
          error: `Executable file type "${rawExt}" is restricted for security.`,
        },
        { status: 400 }
      );
    }

    const safeExt = rawExt && /^\.[a-z0-9_-]{1,12}$/i.test(rawExt) ? rawExt : "";
    const randomId = crypto.randomUUID();
    const secureFileName = safeExt ? `${randomId}${safeExt}` : `${randomId}.bin`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Try Supabase Storage if configured
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
          contentType: file.type || "application/octet-stream",
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
          originalName: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          storage: "supabase",
        });
      }
    }

    // 4. Local fallback storage (public/uploads/)
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
