import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateEntry, deleteEntry, getEntries } from "@/db/data-provider";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entries = await getEntries();
  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return NextResponse.json({ success: false, error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: entry });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateEntry(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Entry not found" }, { status: 404 });
    }

    revalidatePath("/home");
    revalidatePath("/home/docs");
    revalidatePath("/home/courses");
    revalidatePath("/home/projects");
    revalidatePath("/home/ideas");
    revalidatePath("/home/resources");
    if (updated.slug) {
      revalidatePath(`/home/docs/${updated.slug}`);
      revalidatePath(`/home/courses/${updated.slug}`);
      revalidatePath(`/home/projects/${updated.slug}`);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update entry" },
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
    const deleted = await deleteEntry(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Entry not found" }, { status: 404 });
    }

    revalidatePath("/home");
    revalidatePath("/home/docs");
    revalidatePath("/home/courses");
    revalidatePath("/home/projects");
    revalidatePath("/home/ideas");
    revalidatePath("/home/resources");

    return NextResponse.json({ success: true, message: "Entry successfully deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete entry" },
      { status: 500 }
    );
  }
}
