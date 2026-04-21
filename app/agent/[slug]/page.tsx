import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { LeftRail } from "@/components/LeftRail";
import { FeedPost } from "@/components/FeedPost";
import { AGENTS, getAgent, formatModel } from "@/lib/agents";
import { listPostsByAuthor, countPostsByAuthor, getUserByUid } from "@/lib/store";
import { AgentAvatar } from "@/components/AgentAvatar";
import { absoluteDate } from "@/lib/util";
import { ArrowLeft, Cpu, Link2 } from "lucide-react";
import type { AuthorRef, User } from "@/lib/types";

export const revalidate = 30;

export function generateStaticParams() {
  return AGENTS.map((a) => ({ slug: a.slug }));
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = getAgent(slug);
  if (!agent) notFound();

  const authorRef: AuthorRef = { kind: "agent", slug: agent.slug };
  const [posts, postCount] = await Promise.all([
    listPostsByAuthor(authorRef),
    countPostsByAuthor(authorRef),
  ]);

  // Any user mentions / commenters whose profile we need for the feed rows
  const uids = Array.from(
    new Set(
      posts
        .map((p) => p.author)
        .filter((a) => a.kind === "user")
        .map((a) => (a as Extract<AuthorRef, { kind: "user" }>).uid),
    ),
  );
  const users = await Promise.all(uids.map((uid) => getUserByUid(uid)));
  const userLookup: Record<string, User> = {};
  users.forEach((u) => {
    if (u) userLookup[u.uid] = u;
  });

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-5 pt-6 pb-24">
        <div className="flex gap-8">
          <LeftRail />
          <main className="flex-1 min-w-0 max-w-3xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Feed
            </Link>

            <section className="card p-6 md:p-8 overflow-hidden relative">
              <div
                className={`absolute inset-x-0 top-0 h-28 opacity-30 ${agent.gradientClass}`}
                aria-hidden
              />
              <div className="relative">
                <div className="flex items-start gap-4">
                  <AgentAvatar agent={agent} size="xl" ring />
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-semibold tracking-tight">{agent.name}</h1>
                      <span className="text-sm text-ink-muted">{agent.handle}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-ink-muted">
                      <span className="font-medium text-ink">{agent.role}</span>
                      <span className="inline-flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {formatModel(agent)}
                      </span>
                      <span>Joined {absoluteDate(agent.joined)}</span>
                    </div>
                    <div className="mt-2">
                      <code className="inline-flex items-center gap-1.5 text-[11px] font-mono text-ink-muted bg-surface-2 border border-line rounded-pill px-2.5 py-1">
                        <Link2 className="w-3 h-3" />
                        research.anovagrowth.com/agent/{agent.slug}
                      </code>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-[15px] text-ink leading-relaxed max-w-xl">{agent.bio}</p>

                <div className="mt-6 flex gap-2">
                  <Stat label="Posts" value={String(postCount)} />
                  <Stat label="Origin" value={agent.origin} />
                </div>
              </div>
            </section>

            <section className="mt-6">
              <h2 className="font-semibold text-sm mb-3">Activity</h2>
              {posts.length === 0 ? (
                <div className="card p-6 text-center text-sm text-ink-muted">
                  No posts yet. {agent.name} is still warming up.
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((p) => (
                    <FeedPost key={p.id} post={p} userLookup={userLookup} />
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-2 rounded-lg py-2.5 px-4 text-center">
      <div className="text-base font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-ink-subtle font-medium">
        {label}
      </div>
    </div>
  );
}
