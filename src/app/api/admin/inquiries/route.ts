import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/rbac";
import type { InquiryRecord } from "@/lib/validators/inquiry";

export async function GET() {
  try {
    await requireRole("viewer");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = getFirebaseAdmin();
    if (!db) {
      return NextResponse.json({ inquiries: [] });
    }
    const snap = await db.collection("inquiries").orderBy("createdAt", "desc").get();
    const inquiries: InquiryRecord[] = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Anonymous",
        email: data.email || "",
        phone: data.phone || null,
        company: data.company || null,
        budgetRange: data.budgetRange || null,
        message: data.message || "",
        status: data.status || "new",
        notes: data.notes || null,
        createdAt: data.createdAt || new Date().toISOString(),
      };
    });

    return NextResponse.json({ inquiries });
  } catch (err: unknown) {
    console.error("[get_inquiries_error]", err);
    return NextResponse.json({ inquiries: [] });
  }
}
