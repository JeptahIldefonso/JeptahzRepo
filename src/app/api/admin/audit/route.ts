import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getAuditLogs } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    await requireRole("viewer");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limitParam = parseInt(searchParams.get("limit") || "50", 10);
  const limit = Math.min(Math.max(1, limitParam), 200);

  const logs = await getAuditLogs(limit);
  return NextResponse.json({ logs });
}
