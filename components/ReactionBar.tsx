"use client";

import { useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import type { ReactionKind, ReactionMap } from "@/lib/types";
import { useCurrentUser } from "@/lib/client-auth";

const EMOJI: Record<ReactionKind, { emoji: string; label: string }> = {
  insight: { emoji: "🧠", label: "Insight" },
  brilliant: { emoji: "💡", label: "Brilliant" },
  spicy: { emoji: "🌶️", label: "Spicy" },
  agree: { emoji: "🤝", label: "Agree" },
  spark: { emoji: "✨", label: "Spark" },
};

export function ReactionBar({
  target,
  reactions,
  size = "md",
}: {
  target: { kind: "post" | "comment"; id: string };
  reactions: ReactionMap;
  size?: "sm" | "md";
}) {
  const [local, setLocal] = useState<ReactionMap>(reactions ?? {});
  const user = useCurrentUser();
  const router = useRouter();

  // Only show reaction kinds that have real reactions, unless user is authed (then show "+ react")
  const populated = (Object.keys(EMOJI) as ReactionKind[]).filter(
    (k) => (local[k]?.length ?? 0) > 0,
  );

  const padding = size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5";

  async function react(kind: ReactionKind) {
    if (!user) {
      router.push("/login");
      return;
    }
    // Optimistic toggle
    setLocal((prev) => {
      const nxt: ReactionMap = { ...prev };
      const set = new Set(nxt[kind] ?? []);
      if (set.has(user.uid)) set.delete(user.uid);
      else set.add(user.uid);
      nxt[kind] = Array.from(set);
      return nxt;
    });
    await fetch(`/api/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, reaction: kind }),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {populated.map((k) => {
        const meta = EMOJI[k];
        const count = local[k]?.length ?? 0;
        const mine = user ? local[k]?.includes(user.uid) : false;
        return (
          <button
            key={k}
            onClick={() => react(k)}
            className={clsx(
              "inline-flex items-center gap-1 rounded-pill border transition-all text-xs",
              padding,
              mine
                ? "bg-brand-soft border-brand/30 text-brand"
                : "bg-surface-2 border-line text-ink-muted hover:border-line-strong hover:text-ink",
            )}
            aria-label={`${meta.label}: ${count}`}
          >
            <span className="text-[13px] leading-none">{meta.emoji}</span>
            <span className="font-medium tabular-nums">{count}</span>
          </button>
        );
      })}
      <AddReaction onPick={react} authed={!!user} />
    </div>
  );
}

function AddReaction({
  onPick,
  authed,
}: {
  onPick: (k: ReactionKind) => void;
  authed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <div className="relative">
      <button
        onClick={() => (authed ? setOpen((v) => !v) : router.push("/login"))}
        className="inline-flex items-center gap-1 rounded-pill border border-dashed border-line text-ink-subtle hover:text-ink hover:border-ink-muted px-2.5 py-1.5 text-xs transition-colors"
        aria-label="Add reaction"
        title={authed ? "Add reaction" : "Sign in to react"}
      >
        <span>+</span>
        <span>react</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 mb-2 flex items-center gap-1 bg-white border border-line rounded-pill shadow-pop p-1 z-10"
          onMouseLeave={() => setOpen(false)}
        >
          {(Object.keys(EMOJI) as ReactionKind[]).map((k) => (
            <button
              key={k}
              onClick={() => {
                onPick(k);
                setOpen(false);
              }}
              className="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-base transition-transform hover:scale-110"
              aria-label={EMOJI[k].label}
              title={EMOJI[k].label}
            >
              {EMOJI[k].emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
