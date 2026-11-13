import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { inquiryInputSchema } from "@/lib/validators/inquiry";
import { limit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // 1. IP Rate Limiting (Blueprint Section 14: 5 requests / hour / IP)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown-ip";

    const rate = await limit(`contact:${ip}`, 5, 60 * 60 * 1000);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many inquiries submitted from this connection. Please try again later." },
        { status: 429 }
      );
    }

    // 2. Body parsing and Zod validation
    const rawBody = await req.json().catch(() => null);
    const parsed = inquiryInputSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid input. Please correct the highlighted fields.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { website, ...data } = parsed.data;

    // 3. Honeypot check: If website is filled, return fake success without persisting
    if (website && website.trim().length > 0) {
      console.warn(`[contact_honeypot_bot_blocked] IP: ${ip}`);
      return NextResponse.json({ ok: true });
    }

    // 4. Persistence into Firebase Firestore
    try {
      const { db } = getFirebaseAdmin();
      if (db) {
        const docRef = db.collection("inquiries").doc();
        await docRef.set({
          id: docRef.id,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          company: data.company || null,
          budgetRange: data.budgetRange || null,
          message: data.message,
          status: "new",
          notes: null,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      console.warn("[contact_firebase_fallback_write]", dbErr);
      // Non-blocking in mock/fallback environments
    }

    return NextResponse.json({ ok: true, message: "Inquiry submitted successfully." });
  } catch (err) {
    console.error("[contact_api_exception]", err);
    return NextResponse.json(
      { error: "Failed to process inquiry. Please try again later." },
      { status: 500 }
    );
  }
}
