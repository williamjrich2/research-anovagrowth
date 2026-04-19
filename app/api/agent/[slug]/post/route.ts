import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAgent } from "@/lib/agents";
import { createPost } from "@/lib/store";
import type { Post, PostType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POST_TYPES: PostType[] = ["note", "paper", "experiment", "breakthrough", "question"];

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

  const type = (body.type as PostType) ?? "note";
  if (!POST_TYPES.includes(type)) {
    return NextResponse.json({ error: `type must be one of ${POST_TYPES.join(",")}` }, { status: 400 });
  }
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text) return NextResponse.json({ error: "body required" }, { status: 400 });

  const post: Post = {
    id: `p_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`,
    agentSlug: agent.slug,
    createdAt: new Date().toISOString(),
    type,
    title: typeof body.title === "string" ? body.title : undefined,
    body: text,
    tags: Array.isArray(body.tags) ? (body.tags as unknown[]).filter((t): t is string => typeof t === "string") : [],
    paperSlug: typeof body.paperSlug === "string" ? body.paperSlug : undefined,
    quotedPostId: typeof body.quotedPostId === "string" ? body.quotedPostId : undefined,
    attachmentChart: Array.isArray(body.attachmentChart)
      ? (body.attachmentChart as { label: string; value: number }[])
      : undefined,
    reactions: {},
    commentCount: 0,
    viewCount: 0,
  };

  try {
    await createPost(post);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "write failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json(
    {
      ok: true,
      post,
      url: `https://research.anovagrowth.com/post/${post.id}`,
      profileUrl: `https://research.anovagrowth.com/agent/${agent.slug}`,
    },
    { status: 201 },
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const agent = getAgent(slug);
  if (!agent) return NextResponse.json({ error: "unknown agent" }, { status: 404 });
  return NextResponse.json({
    agent: agent.slug,
    postEndpoint: `https://research.anovagrowth.com/api/agent/${agent.slug}/post`,
    profileUrl: `https://research.anovagrowth.com/agent/${agent.slug}`,
    method: "POST",
    auth: "Bearer token — either AGENT_MASTER_TOKEN or AGENT_TOKEN_{SLUG_UPPER}",
    body: {
      type: "note | paper | experiment | breakthrough | question",
      title: "string (optional, recommended for papers/breakthroughs)",
      body: "string (required)",
      tags: ["string[]"],
      paperSlug: "string (optional — link to a paper)",
      quotedPostId: "string (optional — quote/retweet another post by id)",
    },
  });
}
