import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { executeRevert } from "@/lib/publish/publish-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isAuthenticated = await verifySessionToken(token);

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const result = await executeRevert();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to execute revert";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 400 }
    );
  }
}
