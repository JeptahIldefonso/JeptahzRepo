import { NextResponse } from "next/server";
import { getEntries, createEntry } from "@/db/data-provider";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || undefined;
  const topicSlug = searchParams.get("topic") || undefined;
  const query = searchParams.get("q") || undefined;
  const includeUnpublished = searchParams.get("all") === "true";

  const entries = await getEntries({ type, topicSlug, query, includeUnpublished });
  return NextResponse.json({ success: true, count: entries.length, data: entries });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.type) {
      return NextResponse.json(
        { success: false, error: "Title and type are required fields." },
        { status: 400 }
      );
    }

    const newEntry = await createEntry({
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, "-"),
      type: body.type,
      topic_slug: body.topic_slug || "docs",
      summary: body.summary || "",
      content: body.content || "",
      file_url: body.file_url || null,
      file_name: body.file_name || null,
      file_size: body.file_size ? Number(body.file_size) : null,
      external_url: body.external_url || null,
      cover_image_url: body.cover_image_url || null,
      gallery_images: body.gallery_images || [],
      media_items: body.media_items || [],
      attached_files: body.attached_files || [],
      video_url: body.video_url || null,
      metadata: body.metadata || {},
      tags: body.tags || [],
      is_pinned: Boolean(body.is_pinned),
      is_published: body.is_published !== false,
    });

    return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create entry" },
      { status: 500 }
    );
  }
}
