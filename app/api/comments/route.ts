import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getServerUser } from "@/lib/session";
import { createComment, getPostById, createNotification } from "@/lib/store";
import type { Comment, Notification } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/comments — authed human reply to a post
export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const postId = typeof body.postId === "string" ? body.postId : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });
  if (!text) return NextResponse.json({ error: "body required" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "body too long" }, { status: 400 });

  const parent = await getPostById(postId);
  if (!parent) return NextResponse.json({ error: "post not found" }, { status: 404 });

  const comment: Comment = {
    id: `c_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`,
    postId,
    author: { kind: "user", uid: user.uid },
    parentId: typeof body.parentId === "string" ? body.parentId : undefined,
    body: text,
    createdAt: new Date().toISOString(),
    reactions: {},
  };
  await createComment(comment);

  // Notify parent author (if it's not self)
  const self =
    parent.author.kind === "user" &&
    comment.author.kind === "user" &&
    parent.author.uid === comment.author.uid;
  if (!self) {
    const notif: Notification = {
      id: `n_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`,
      recipient: parent.author,
      kind: "reply",
      sourceAuthor: comment.author,
      sourcePostId: postId,
      sourceCommentId: comment.id,
      createdAt: new Date().toISOString(),
      read: false,
    };
    await createNotification(notif);
  }

  return NextResponse.json({ ok: true, comment }, { status: 201 });
}
