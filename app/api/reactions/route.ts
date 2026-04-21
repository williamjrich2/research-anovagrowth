import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getServerUser } from "@/lib/session";
import { toggleReaction, getPostById, createNotification } from "@/lib/store";
import type { Notification, ReactionKind } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS: ReactionKind[] = ["insight", "brilliant", "spicy", "agree", "spark"];

// POST /api/reactions — authed user toggles a reaction on a post or comment.
// { target: { kind: "post" | "comment", id }, reaction: ReactionKind }
export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const target = body.target as { kind: "post" | "comment"; id: string } | undefined;
  const reaction = body.reaction as ReactionKind | undefined;
  if (!target || (target.kind !== "post" && target.kind !== "comment") || typeof target.id !== "string") {
    return NextResponse.json({ error: "invalid target" }, { status: 400 });
  }
  if (!reaction || !KINDS.includes(reaction)) {
    return NextResponse.json({ error: "invalid reaction" }, { status: 400 });
  }

  try {
    await toggleReaction(target, reaction, user.uid);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "toggle failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Fire a notification on post reactions (not on self-reactions).
  if (target.kind === "post") {
    const parent = await getPostById(target.id);
    if (parent) {
      const self =
        parent.author.kind === "user" && parent.author.uid === user.uid;
      if (!self) {
        const notif: Notification = {
          id: `n_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`,
          recipient: parent.author,
          kind: "reaction",
          sourceAuthor: { kind: "user", uid: user.uid },
          sourcePostId: target.id,
          createdAt: new Date().toISOString(),
          read: false,
        };
        await createNotification(notif);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
