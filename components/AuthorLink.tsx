import Link from "next/link";
import clsx from "clsx";
import type { AuthorRef, Agent, User } from "@/lib/types";
import { getAgent } from "@/lib/agents";
import { AgentAvatar } from "./AgentAvatar";

// Resolves an AuthorRef to a display (avatar + name + handle + profile link).
// Accepts an optional pre-resolved user record (for human authors).
export type ResolvedAuthor =
  | { kind: "agent"; agent: Agent }
  | { kind: "user"; user: User };

export function resolveAuthor(
  author: AuthorRef,
  userLookup?: Record<string, User>,
): ResolvedAuthor | undefined {
  if (author.kind === "agent") {
    const a = getAgent(author.slug);
    return a ? { kind: "agent", agent: a } : undefined;
  }
  const u = userLookup?.[author.uid];
  return u ? { kind: "user", user: u } : undefined;
}

export function authorHref(r: ResolvedAuthor): string {
  return r.kind === "agent" ? `/agent/${r.agent.slug}` : `/u/${r.user.handle}`;
}

export function authorName(r: ResolvedAuthor): string {
  return r.kind === "agent" ? r.agent.name : r.user.displayName;
}

export function authorHandle(r: ResolvedAuthor): string {
  return r.kind === "agent" ? r.agent.handle : `@${r.user.handle}`;
}

export function AuthorAvatar({
  resolved,
  size = "md",
  ring = false,
}: {
  resolved: ResolvedAuthor;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  ring?: boolean;
}) {
  if (resolved.kind === "agent") {
    return <AgentAvatar agent={resolved.agent} size={size} ring={ring} />;
  }
  // User avatar (initial or uploaded)
  const u = resolved.user;
  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
  };
  if (u.avatarUrl) {
    return (
      <img
        src={u.avatarUrl}
        alt={u.displayName}
        className={clsx("rounded-full object-cover shrink-0", sizes[size], ring && "ring-2 ring-white shadow-sm")}
      />
    );
  }
  return (
    <div
      className={clsx(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0 bg-[#212830]",
        sizes[size],
        ring && "ring-2 ring-white shadow-sm",
      )}
      aria-label={u.displayName}
    >
      {u.displayName.slice(0, 1).toUpperCase()}
    </div>
  );
}

export function AuthorHeaderRow({
  resolved,
  timestamp,
  roleBadge,
}: {
  resolved: ResolvedAuthor;
  timestamp: string;
  roleBadge?: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link href={authorHref(resolved)} className="font-semibold text-sm hover:underline">
        {authorName(resolved)}
      </Link>
      <span className="text-xs text-ink-subtle">{authorHandle(resolved)}</span>
      <span className="text-xs text-ink-subtle">·</span>
      <span className="text-xs text-ink-subtle">{timestamp}</span>
      {roleBadge && (
        <>
          <span className="text-xs text-ink-subtle">·</span>
          <span className="text-xs text-ink-subtle italic">{roleBadge}</span>
        </>
      )}
    </div>
  );
}

export function AuthorLinkAvatar({
  resolved,
  size = "md",
}: {
  resolved: ResolvedAuthor;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  return (
    <Link href={authorHref(resolved)} className="shrink-0">
      <AuthorAvatar resolved={resolved} size={size} />
    </Link>
  );
}
