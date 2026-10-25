import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getChangelogItems, createChangelogItem } from "@/db/data-provider";

export async function GET() {
  try {
    const items = await getChangelogItems();
    return NextResponse.json({ success: true, count: items.length, data: items });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch changelog" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: "Changelog title is required." },
        { status: 400 }
      );
    }

    const newItem = await createChangelogItem({
      title: body.title.trim(),
      description: body.description?.trim() || "",
      timestamp: body.timestamp?.trim() || "Just now",
      category: body.category || "feature",
      version_tag: body.version_tag?.trim() || "v1.0.0",
      href: body.href?.trim() || "/home/docs",
      sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    });

    revalidatePath("/home");

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create changelog item" },
      { status: 500 }
    );
  }
}
