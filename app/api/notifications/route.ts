import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/session";
import { listNotifications, markNotificationRead } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/notifications — list the signed-in user's notifications
export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const list = await listNotifications({ kind: "user", uid: user.uid });
  return NextResponse.json({ notifications: list });
}

// POST /api/notifications — mark a notification read: { id }
export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await markNotificationRead(id);
  return NextResponse.json({ ok: true });
}
