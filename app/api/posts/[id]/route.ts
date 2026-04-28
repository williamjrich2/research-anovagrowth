import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/session";
import { getDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DELETE /api/posts/:id — owner-only. Also deletes the post's comments and any
// notifications that reference it, so the feed doesn't render orphaned rows.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!user.isOwner)
    return NextResponse.json({ error: "forbidden — owner only" }, { status: 403 });

  const { id } = await params;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  const pRef = db.collection("posts").doc(id);
  const pSnap = await pRef.get();
  if (!pSnap.exists)
    return NextResponse.json({ error: "post not found" }, { status: 404 });

  const [commentsSnap, notifsSnap] = await Promise.all([
    db.collection("comments").where("postId", "==", id).get(),
    db.collection("notifications").where("sourcePostId", "==", id).get(),
  ]);

  await Promise.all([
    ...commentsSnap.docs.map((d) => d.ref.delete()),
    ...notifsSnap.docs.map((d) => d.ref.delete()),
    pRef.delete(),
  ]);

  return NextResponse.json({
    ok: true,
    deleted: { postId: id, comments: commentsSnap.size, notifications: notifsSnap.size },
  });
}
