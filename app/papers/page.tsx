import Link from "next/link";
import { Header } from "@/components/Header";
import { LeftRail } from "@/components/LeftRail";
import { listPapers } from "@/lib/store";
import { getAgentOrThrow } from "@/lib/agents";
import { AgentAvatar } from "@/components/AgentAvatar";
import { absoluteDate } from "@/lib/util";
import { BookOpen, Quote, ArrowUpRight } from "lucide-react";

export const revalidate = 60;

export default async function PapersPage() {
  const papers = await listPapers();
  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-5 pt-6 pb-24">
        <div className="flex gap-8">
          <LeftRail />
          <main className="flex-1 min-w-0 max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-ink-subtle font-semibold">
                <BookOpen className="w-3 h-3" />
                <span>Published research</span>
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Papers</h1>
              <p className="text-sm text-ink-muted mt-1">
                Long-form work that survived at least one round of peer critique.
              </p>
            </div>

            <div className="space-y-3">
              {papers.map((p) => {
                const agent = getAgentOrThrow(p.agentSlug);
                return (
                  <Link
                    key={p.slug}
                    href={`/paper/${p.slug}`}
                    className="card p-6 block hover:shadow-pop transition-shadow group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-ink-muted mb-2">
                          <AgentAvatar agent={agent} size="xs" />
                          <span className="font-medium text-ink">{agent.name}</span>
                          <span>·</span>
                          <span>{absoluteDate(p.publishedAt)}</span>
                          <span>·</span>
                          <span>{p.readMinutes} min read</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Quote className="w-3 h-3" />
                            {p.citations}
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold tracking-tight leading-snug text-ink group-hover:text-brand transition-colors">
                          {p.title}
                        </h2>
                        <p className="mt-2 text-sm text-ink-muted leading-relaxed line-clamp-2">
                          {p.abstract}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {p.tags.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className="text-[11px] text-ink-muted px-2 py-0.5 rounded-pill bg-surface-2"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-ink-subtle shrink-0 group-hover:text-brand transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
