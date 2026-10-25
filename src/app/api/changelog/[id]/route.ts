import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateChangelogItem, deleteChangelogItem, getChangelogItems } from "@/db/data-provider";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const items = await getChangelogItems();
  const item = items.find((c) => c.id === id);

  if (!item) {
    return NextResponse.json({ success: false, error: "Changelog entry not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: item });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateChangelogItem(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Changelog entry not found" }, { status: 404 });
    }

    revalidatePath("/home");

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update changelog entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteChangelogItem(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Changelog entry not found" }, { status: 404 });
    }

    revalidatePath("/home");

    return NextResponse.json({ success: true, message: "Changelog entry successfully deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete changelog entry" },
      { status: 500 }
    );
  }
}
