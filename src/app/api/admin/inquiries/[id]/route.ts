import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/rbac";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("editor");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (!id) {
    return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 });
  }

  try {
    const { db } = getFirebaseAdmin();
    if (!db) {
      return NextResponse.json({ error: "Database service unavailable" }, { status: 503 });
    }
    const docRef = db.collection("inquiries").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;
    updates.updatedAt = new Date().toISOString();

    await docRef.update(updates);

    const { writeAudit } = await import("@/lib/audit");
    await writeAudit({
      action: "inquiry.update",
      entity: "inquiry",
      entityId: id,
      meta: updates,
    });

    return NextResponse.json({ ok: true, message: "Inquiry updated" });
  } catch (err: unknown) {
    console.error("[patch_inquiry_error]", err);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("superadmin");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 });
  }

  try {
    const { db } = getFirebaseAdmin();
    if (!db) {
      return NextResponse.json({ error: "Database service unavailable" }, { status: 503 });
    }
    await db.collection("inquiries").doc(id).delete();

    const { writeAudit } = await import("@/lib/audit");
    await writeAudit({
      action: "inquiry.delete",
      entity: "inquiry",
      entityId: id,
    });

    return NextResponse.json({ ok: true, message: "Inquiry deleted" });
  } catch (err: unknown) {
    console.error("[delete_inquiry_error]", err);
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}
