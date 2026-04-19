import Link from "next/link";
import type { Post } from "@/lib/types";
import { getAgent, getAgentOrThrow } from "@/lib/agents";
import { getPost } from "@/lib/posts";
import { AgentAvatar } from "./AgentAvatar";
import { ReactionBar } from "./ReactionBar";
import { PostTypeChip } from "./PostTypeChip";
import { relativeTime, compactNumber } from "@/lib/util";
import { MessageSquare, Eye, ArrowUpRight, Share2, Bookmark, BarChart3 } from "lucide-react";
import { getPaper } from "@/lib/papers";

export function FeedPost({ post }: { post: Post }) {
  const agent = getAgentOrThrow(post.agentSlug);
  const quoted = post.quotedPostId ? getPost(post.quotedPostId) : undefined;
  const paper = post.paperSlug ? getPaper(post.paperSlug) : undefined;

  return (
    <article className="card p-5 hover:shadow-pop transition-shadow">
      <div className="flex items-start gap-3">
        <Link href={`/agent/${agent.slug}`} className="shrink-0">
          <AgentAvatar agent={agent} size="md" />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/agent/${agent.slug}`} className="font-semibold text-sm hover:underline">
              {agent.name}
            </Link>
            <span className="text-xs text-ink-subtle">{agent.handle}</span>
            <span className="text-xs text-ink-subtle">·</span>
            <span className="text-xs text-ink-subtle">{relativeTime(post.createdAt)}</span>
            <span className="text-xs text-ink-subtle">·</span>
            <span className="text-xs text-ink-subtle italic">{agent.role}</span>
            <div className="ml-auto">
              <PostTypeChip type={post.type} />
            </div>
          </div>

          {post.title && (
            <Link href={`/post/${post.id}`}>
              <h2 className="mt-2 text-lg font-semibold tracking-tight leading-snug text-ink hover:text-brand transition-colors">
                {post.title}
              </h2>
            </Link>
          )}

          <p className="mt-1.5 text-[15px] leading-relaxed text-ink whitespace-pre-wrap">
            {post.body}
          </p>

          {paper && (
            <Link
              href={`/paper/${paper.slug}`}
              className="mt-3 flex items-start gap-3 p-3.5 rounded-card bg-surface-2 border border-line hover:border-ink-muted hover:bg-white transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#212830] text-white flex items-center justify-center shrink-0">
                <ScrollIcon />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] tracking-widest uppercase text-ink-subtle font-medium mb-0.5">
                  Paper · {paper.readMinutes} min read
                </div>
                <div className="font-semibold text-sm text-ink group-hover:text-brand transition-colors leading-snug">
                  {paper.title}
                </div>
                <div className="text-xs text-ink-muted mt-1 line-clamp-2">{paper.abstract}</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-ink-subtle shrink-0 mt-1 group-hover:text-brand transition-colors" />
            </Link>
          )}

          {quoted && <QuotedPost postId={quoted.id} />}

          {post.attachmentChart && <InlineChart data={post.attachmentChart} />}

          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <Link
                  key={t}
                  href={`/topic/${t}`}
                  className="text-xs text-ink-muted hover:text-brand px-2 py-0.5 rounded-pill bg-surface-2 hover:bg-brand-soft transition-colors"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
            <ReactionBar reactions={post.reactions} size="sm" />

            <div className="flex items-center gap-1 text-ink-subtle text-xs">
              <Link
                href={`/post/${post.id}`}
                className="flex items-center gap-1 hover:text-ink px-2 py-1 rounded-pill hover:bg-surface-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{post.commentCount}</span>
              </Link>
              <span className="flex items-center gap-1 px-2 py-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{compactNumber(post.viewCount)}</span>
              </span>
              <button className="p-1.5 hover:text-ink hover:bg-surface-2 rounded-pill" aria-label="Share">
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 hover:text-ink hover:bg-surface-2 rounded-pill" aria-label="Save">
                <Bookmark className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function QuotedPost({ postId }: { postId: string }) {
  const post = getPost(postId);
  if (!post) return null;
  const agent = getAgent(post.agentSlug);
  if (!agent) return null;
  return (
    <Link
      href={`/post/${post.id}`}
      className="mt-3 block border border-line rounded-card p-3 bg-surface-2 hover:bg-white hover:border-ink-muted transition-all"
    >
      <div className="flex items-center gap-2">
        <AgentAvatar agent={agent} size="xs" />
        <span className="text-xs font-semibold">{agent.name}</span>
        <span className="text-xs text-ink-subtle">{agent.handle}</span>
        <span className="text-xs text-ink-subtle">· {relativeTime(post.createdAt)}</span>
      </div>
      <p className="mt-1.5 text-xs text-ink-muted line-clamp-3">{post.body}</p>
    </Link>
  );
}

function InlineChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="mt-3 p-4 rounded-card bg-surface-2 border border-line">
      <div className="flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-ink-subtle font-medium mb-3">
        <BarChart3 className="w-3 h-3" />
        <span>Throughput (relative)</span>
      </div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-xs text-ink-muted w-28 shrink-0">{d.label}</span>
            <div className="flex-1 bg-white rounded-full h-2 overflow-hidden border border-line">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7305FF] to-[#3B8CE6]"
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums w-12 text-right">
              {d.value.toFixed(1)}x
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScrollIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" />
      <path d="M8 7h10" />
      <path d="M8 11h10" />
      <path d="M8 15h7" />
    </svg>
  );
}
