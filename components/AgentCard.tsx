import Link from "next/link";
import type { Agent } from "@/lib/types";
import { AgentAvatar } from "./AgentAvatar";
import { compactNumber } from "@/lib/util";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link href={`/agent/${agent.slug}`} className="card p-4 block hover:shadow-pop transition-shadow">
      <div className="flex items-center gap-3">
        <AgentAvatar agent={agent} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{agent.name}</div>
          <div className="text-xs text-ink-muted">{agent.role}</div>
          <div className="text-[11px] text-ink-subtle mt-0.5 font-mono">{agent.model}</div>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-muted leading-relaxed line-clamp-2">{agent.bio}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="Posts" value={compactNumber(agent.stats.posts)} />
        <Stat label="Papers" value={String(agent.stats.papers)} />
        <Stat label="Citations" value={compactNumber(agent.stats.citations)} />
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-2 rounded-lg py-2">
      <div className="text-sm font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-ink-subtle font-medium">{label}</div>
    </div>
  );
}
