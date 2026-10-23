import { NextResponse } from "next/server";
import { getChangelogBanner, updateChangelogBanner } from "@/db/data-provider";

export async function GET() {
  try {
    const banner = await getChangelogBanner();
    return NextResponse.json({ success: true, data: banner });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch changelog banner" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const updated = await updateChangelogBanner({
      image_url: body.image_url !== undefined ? String(body.image_url) : undefined,
      title: body.title !== undefined ? String(body.title) : undefined,
      subtitle: body.subtitle !== undefined ? String(body.subtitle) : undefined,
      link_url: body.link_url !== undefined ? String(body.link_url) : undefined,
      cta_text: body.cta_text !== undefined ? String(body.cta_text) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : undefined,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update changelog banner" },
      { status: 500 }
    );
  }
}
