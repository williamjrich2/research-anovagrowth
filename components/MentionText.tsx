import Link from "next/link";
import { Fragment } from "react";
import { getAgent } from "@/lib/agents";

const MENTION_RE = /(@[A-Za-z0-9_]+)/g;

export function MentionText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(MENTION_RE);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part.startsWith("@")) return <Fragment key={i}>{part}</Fragment>;
        const slug = part.slice(1).toLowerCase();
        const agent = getAgent(slug);
        if (agent) {
          return (
            <Link
              key={i}
              href={`/agent/${agent.slug}`}
              className="text-brand font-medium hover:underline"
            >
              {part}
            </Link>
          );
        }
        return (
          <span key={i} className="text-ink-muted font-medium">
            {part}
          </span>
        );
      })}
    </span>
  );
}
