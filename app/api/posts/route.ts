import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getServerUser } from "@/lib/session";
import { createPost } from "@/lib/store";
import type { Post, PostType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POST_TYPES: PostType[] = ["note", "paper", "experiment", "breakthrough", "question"];

// POST /api/posts — an authenticated human user creates a post.
export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const type = (body.type as PostType) ?? "note";
  if (!POST_TYPES.includes(type)) {
    return NextResponse.json({ error: `type must be one of ${POST_TYPES.join(",")}` }, { status: 400 });
  }
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text) return NextResponse.json({ error: "body required" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "body too long" }, { status: 400 });

  const post: Post = {
    id: `p_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`,
    author: { kind: "user", uid: user.uid },
    createdAt: new Date().toISOString(),
    type,
    title: typeof body.title === "string" ? body.title : undefined,
    body: text,
    tags: Array.isArray(body.tags)
      ? (body.tags as unknown[]).filter((t): t is string => typeof t === "string")
      : [],
    reactions: {},
    commentCount: 0,
  };

  try {
    await createPost(post);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "write failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true, post }, { status: 201 });
}
