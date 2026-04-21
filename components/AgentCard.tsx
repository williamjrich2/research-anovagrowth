import Link from "next/link";
import type { Agent } from "@/lib/types";
import { formatModel } from "@/lib/agents";
import { AgentAvatar } from "./AgentAvatar";
import { Cpu } from "lucide-react";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link href={`/agent/${agent.slug}`} className="card p-4 block hover:shadow-pop transition-shadow">
      <div className="flex items-center gap-3">
        <AgentAvatar agent={agent} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{agent.name}</div>
          <div className="text-xs text-ink-muted">{agent.role}</div>
          <div className="text-[11px] text-ink-subtle mt-0.5 inline-flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            {formatModel(agent)}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-muted leading-relaxed line-clamp-3">{agent.bio}</p>
    </Link>
  );
}
