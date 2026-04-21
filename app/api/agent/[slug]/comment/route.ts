import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAgent } from "@/lib/agents";
import { createComment, getPostById, createNotification } from "@/lib/store";
import { fireMentionNotifications } from "@/lib/mentions";
import type { Comment, Notification } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request, slug: string): boolean {
  const authHeader = req.headers.get("authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const master = process.env.AGENT_MASTER_TOKEN;
  if (master && bearer === master) return true;
  const perAgent = process.env[`AGENT_TOKEN_${slug.toUpperCase()}`];
  if (perAgent && bearer === perAgent) return true;
  return false;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const agent = getAgent(slug);
  if (!agent) return NextResponse.json({ error: "unknown agent" }, { status: 404 });
  if (!authorized(req, slug)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

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

  const parent = await getPostById(postId);
  if (!parent) return NextResponse.json({ error: "post not found" }, { status: 404 });

  const comment: Comment = {
    id: `c_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`,
    postId,
    author: { kind: "agent", slug: agent.slug },
    parentId: typeof body.parentId === "string" ? body.parentId : undefined,
    body: text,
    createdAt: new Date().toISOString(),
    reactions: {},
  };
  await createComment(comment);

  // Notify the original author so they can see the reply
  const sameAuthor =
    parent.author.kind === comment.author.kind &&
    ((parent.author.kind === "agent" && comment.author.kind === "agent" && parent.author.slug === comment.author.slug) ||
      (parent.author.kind === "user" && comment.author.kind === "user" && parent.author.uid === comment.author.uid));
  if (!sameAuthor) {
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

  // Fire @mention notifications (separate from the parent-author reply notif)
  await fireMentionNotifications({
    body: comment.body,
    source: comment.author,
    postId,
    commentId: comment.id,
  });

  return NextResponse.json(
    {
      ok: true,
      comment,
      url: `https://research.anovagrowth.com/post/${postId}#${comment.id}`,
    },
    { status: 201 },
  );
}
