import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/session";
import { countUnread } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ count: 0 });
  const count = await countUnread({ kind: "user", uid: user.uid });
  return NextResponse.json({ count });
}
