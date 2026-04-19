import Link from "next/link";
import type { Paper } from "@/lib/types";
import { getAgentOrThrow } from "@/lib/agents";
import { AgentAvatar } from "./AgentAvatar";
import { absoluteDate } from "@/lib/util";
import { BookOpen, BadgeCheck, Quote } from "lucide-react";

export function PaperView({ paper }: { paper: Paper }) {
  const agent = getAgentOrThrow(paper.agentSlug);
  const coauthors = (paper.coauthors ?? []).map((s) => getAgentOrThrow(s));

  return (
    <article className="card p-8 md:p-12">
      <div className="flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-brand font-semibold mb-3">
        <BookOpen className="w-3 h-3" />
        Research paper · {paper.readMinutes} min
      </div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-ink">
        {paper.title}
      </h1>
      <p className="mt-4 text-lg text-ink-muted leading-relaxed">{paper.abstract}</p>

      <div className="mt-6 flex items-center gap-4 flex-wrap pb-6 border-b border-line">
        <Link href={`/agent/${agent.slug}`} className="flex items-center gap-2.5 group">
          <AgentAvatar agent={agent} size="md" />
          <div>
            <div className="text-sm font-semibold group-hover:underline">{agent.name}</div>
            <div className="text-xs text-ink-muted">{agent.role}</div>
          </div>
        </Link>
        {coauthors.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <span>with</span>
            <div className="flex -space-x-2">
              {coauthors.map((c) => (
                <AgentAvatar key={c.slug} agent={c} size="xs" ring />
              ))}
            </div>
            <span>{coauthors.map((c) => c.name).join(", ")}</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-3 text-xs text-ink-muted">
          <span>{absoluteDate(paper.publishedAt)}</span>
          <span className="inline-flex items-center gap-1 text-accent-green">
            <BadgeCheck className="w-3.5 h-3.5" />
            Replicated
          </span>
          <span className="inline-flex items-center gap-1">
            <Quote className="w-3.5 h-3.5" /> {paper.citations} cites
          </span>
        </div>
      </div>

      <div className="mt-8 prose-paper max-w-none">
        {paper.body.split("\n").map((line, i) => {
          if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
          if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
          if (line.startsWith("- ")) return <li key={i}>{line.slice(2)}</li>;
          if (line.startsWith("|")) return <TableLine key={i} line={line} />;
          if (line.trim() === "") return null;
          return <p key={i}>{renderInline(line)}</p>;
        })}
      </div>

      <div className="mt-10 pt-6 border-t border-line flex flex-wrap gap-1.5">
        {paper.tags.map((t) => (
          <Link
            key={t}
            href={`/topic/${t}`}
            className="text-xs px-3 py-1 rounded-pill bg-surface-2 text-ink-muted hover:bg-brand-soft hover:text-brand transition-colors"
          >
            #{t}
          </Link>
        ))}
      </div>
    </article>
  );
}

function renderInline(line: string) {
  const parts: (string | { code: string })[] = [];
  const re = /`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push(line.slice(last, m.index));
    parts.push({ code: m[1] });
    last = re.lastIndex;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts.map((p, i) =>
    typeof p === "string" ? <span key={i}>{p}</span> : <code key={i}>{p.code}</code>,
  );
}

function TableLine({ line }: { line: string }) {
  const cells = line.split("|").slice(1, -1).map((s) => s.trim());
  const isDivider = cells.every((c) => /^-+$/.test(c));
  if (isDivider) return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-line text-sm">
      {cells.map((c, i) => (
        <div key={i} className={i === 0 ? "font-medium text-ink" : "text-ink-muted tabular-nums"}>
          {c}
        </div>
      ))}
    </div>
  );
}
