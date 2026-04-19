"use client";

import { useState } from "react";
import clsx from "clsx";
import type { ReactionKind } from "@/lib/types";

const EMOJI: Record<ReactionKind, { emoji: string; label: string; color: string }> = {
  insight: { emoji: "🧠", label: "Insight", color: "text-accent-violet" },
  brilliant: { emoji: "💡", label: "Brilliant", color: "text-accent-amber" },
  spicy: { emoji: "🌶️", label: "Spicy", color: "text-accent-rose" },
  agree: { emoji: "🤝", label: "Agree", color: "text-accent-green" },
  spark: { emoji: "✨", label: "Spark", color: "text-accent-sky" },
};

export function ReactionBar({
  reactions,
  size = "md",
}: {
  reactions: Partial<Record<ReactionKind, number>>;
  size?: "sm" | "md";
}) {
  const [local, setLocal] = useState(reactions);
  const [picked, setPicked] = useState<ReactionKind | null>(null);

  const bump = (k: ReactionKind) => {
    setLocal((prev) => {
      const nxt = { ...prev };
      if (picked === k) {
        nxt[k] = Math.max(0, (nxt[k] ?? 0) - 1);
        setPicked(null);
      } else {
        if (picked) nxt[picked] = Math.max(0, (nxt[picked] ?? 0) - 1);
        nxt[k] = (nxt[k] ?? 0) + 1;
        setPicked(k);
      }
      return nxt;
    });
  };

  const shown = (Object.keys(EMOJI) as ReactionKind[]).filter(
    (k) => (local[k] ?? 0) > 0 || picked === k,
  );

  const padding = size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((k) => {
        const meta = EMOJI[k];
        const active = picked === k;
        return (
          <button
            key={k}
            onClick={() => bump(k)}
            className={clsx(
              "inline-flex items-center gap-1 rounded-pill border transition-all text-xs",
              padding,
              active
                ? "bg-brand-soft border-brand/30 text-brand"
                : "bg-surface-2 border-line text-ink-muted hover:border-line-strong hover:text-ink",
            )}
            aria-label={`${meta.label}: ${local[k] ?? 0}`}
          >
            <span className="text-[13px] leading-none">{meta.emoji}</span>
            <span className="font-medium tabular-nums">{local[k] ?? 0}</span>
          </button>
        );
      })}
      <AddReaction onPick={bump} pickedSet={new Set(shown)} />
    </div>
  );
}

function AddReaction({
  onPick,
  pickedSet,
}: {
  onPick: (k: ReactionKind) => void;
  pickedSet: Set<ReactionKind>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-pill border border-dashed border-line text-ink-subtle hover:text-ink hover:border-ink-muted px-2.5 py-1.5 text-xs transition-colors"
        aria-label="Add reaction"
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
              className={clsx(
                "w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-base transition-transform hover:scale-110",
                pickedSet.has(k) && "bg-brand-soft",
              )}
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
