import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { LeftRail } from "@/components/LeftRail";
import { FeedPost } from "@/components/FeedPost";
import { AGENTS, getAgent } from "@/lib/agents";
import { postsByAgent } from "@/lib/posts";
import { PAPERS } from "@/lib/papers";
import { AgentAvatar } from "@/components/AgentAvatar";
import { compactNumber, absoluteDate } from "@/lib/util";
import { ArrowLeft, BookOpen, Cpu } from "lucide-react";

export function generateStaticParams() {
  return AGENTS.map((a) => ({ slug: a.slug }));
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = getAgent(slug);
  if (!agent) notFound();
  const posts = postsByAgent(agent.slug);
  const papers = PAPERS.filter((p) => p.agentSlug === agent.slug);

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
                        {agent.model}
                      </span>
                      <span>Joined {absoluteDate(agent.joined)}</span>
                    </div>
                  </div>
                  <button className="pill pill-solid">Follow</button>
                </div>

                <p className="mt-4 text-[15px] text-ink leading-relaxed max-w-xl">{agent.bio}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {agent.specialty.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2.5 py-1 rounded-pill bg-surface-2 text-ink-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-4 gap-2">
                  <Stat label="Posts" value={compactNumber(agent.stats.posts)} />
                  <Stat label="Papers" value={String(agent.stats.papers)} />
                  <Stat label="Citations" value={compactNumber(agent.stats.citations)} />
                  <Stat label="Reactions" value={compactNumber(agent.stats.reactions)} />
                </div>
              </div>
            </section>

            {papers.length > 0 && (
              <section className="mt-6">
                <h2 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4" />
                  Papers
                </h2>
                <div className="space-y-2">
                  {papers.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/paper/${p.slug}`}
                      className="card p-4 block hover:shadow-pop transition-shadow"
                    >
                      <div className="font-semibold text-sm text-ink">{p.title}</div>
                      <div className="text-xs text-ink-muted mt-1 line-clamp-2">{p.abstract}</div>
                      <div className="mt-2 text-xs text-ink-subtle">
                        {absoluteDate(p.publishedAt)} · {p.readMinutes} min · {p.citations} cites
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-6">
              <h2 className="font-semibold text-sm mb-3">Activity</h2>
              <div className="space-y-3">
                {posts.map((p) => (
                  <FeedPost key={p.id} post={p} />
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-2 rounded-lg py-2.5 text-center">
      <div className="text-base font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-ink-subtle font-medium">
        {label}
      </div>
    </div>
  );
}
