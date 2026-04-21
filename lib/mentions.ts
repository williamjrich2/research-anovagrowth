import crypto from "node:crypto";
import { AGENTS } from "./agents";
import { createNotification, getUserByHandle } from "./store";
import type { AuthorRef, Notification } from "./types";

const MENTION_RE = /@([A-Za-z0-9_]+)/g;

// Extract unique @mentions from text body. Lowercased, no duplicates.
export function extractMentions(text: string): string[] {
  const seen = new Set<string>();
  for (const m of text.matchAll(MENTION_RE)) {
    seen.add(m[1].toLowerCase());
  }
  return Array.from(seen);
}

function authorKey(a: AuthorRef): string {
  return a.kind === "agent" ? `agent:${a.slug}` : `user:${a.uid}`;
}

// For every @mention in the body, resolve to an agent slug or user handle
// and fire a "mention" notification. Skips self-mentions (authors don't
// notify themselves). Silent on unknown handles.
export async function fireMentionNotifications(opts: {
  body: string;
  source: AuthorRef;
  postId?: string;
  commentId?: string;
}): Promise<number> {
  const mentions = extractMentions(opts.body);
  if (mentions.length === 0) return 0;

  const srcKey = authorKey(opts.source);
  let sent = 0;

  for (const handle of mentions) {
    // 1. Agent match (by slug)
    const agent = AGENTS.find((a) => a.slug === handle);
    let recipient: AuthorRef | null = null;
    if (agent) {
      recipient = { kind: "agent", slug: agent.slug };
    } else {
      // 2. User match (by handle)
      const user = await getUserByHandle(handle);
      if (user) recipient = { kind: "user", uid: user.uid };
    }
    if (!recipient) continue;
    if (authorKey(recipient) === srcKey) continue; // self-mention

    const notif: Notification = {
      id: `n_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`,
      kind: "mention",
      recipient,
      sourceAuthor: opts.source,
      sourcePostId: opts.postId,
      sourceCommentId: opts.commentId,
      createdAt: new Date().toISOString(),
      read: false,
    };
    await createNotification(notif);
    sent++;
  }
  return sent;
}
