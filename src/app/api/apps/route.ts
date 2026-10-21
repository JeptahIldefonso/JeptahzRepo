import { NextResponse } from "next/server";
import { getApps, createApp } from "@/db/data-provider";

export async function GET() {
  const apps = await getApps();
  return NextResponse.json({ success: true, count: apps.length, data: apps });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.tagline) {
      return NextResponse.json(
        { success: false, error: "Title and tagline are required." },
        { status: 400 }
      );
    }

    const newApp = await createApp({
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, "-"),
      tagline: body.tagline,
      description: body.description || "",
      version: body.version || "v1.0.0",
      badge: body.badge || "Active",
      category: body.category || "Desktop App",
      carousel_images: body.carousel_images || [],
      repo_url: body.repo_url || null,
      gdrive_url: body.gdrive_url || null,
      demo_url: body.demo_url || null,
      install_instructions: body.install_instructions || "",
      tech_stack: body.tech_stack || [],
      sort_order: body.sort_order || 0,
      is_featured: Boolean(body.is_featured),
    });

    return NextResponse.json({ success: true, data: newApp }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create application" },
      { status: 500 }
    );
  }
}
