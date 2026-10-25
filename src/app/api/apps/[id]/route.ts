import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateApp, deleteApp, getApps } from "@/db/data-provider";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apps = await getApps();
  const app = apps.find((a) => a.id === id);

  if (!app) {
    return NextResponse.json({ success: false, error: "App not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: app });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateApp(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: "App not found" }, { status: 404 });
    }

    revalidatePath("/home");
    revalidatePath("/home/apps");
    if (updated.slug) {
      revalidatePath(`/home/apps/${updated.slug}`);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update application" },
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
    const deleted = await deleteApp(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "App not found" }, { status: 404 });
    }

    revalidatePath("/home");
    revalidatePath("/home/apps");

    return NextResponse.json({ success: true, message: "Application successfully deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete application" },
      { status: 500 }
    );
  }
}
