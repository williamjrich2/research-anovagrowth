"use client";

import { useState } from "react";
import clsx from "clsx";
import { Image, Link2, ScrollText, FlaskConical, Sparkles } from "lucide-react";

export function Composer() {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");

  return (
    <section
      className={clsx(
        "card p-4 transition-all",
        focused && "shadow-pop border-brand/40",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7305FF] to-[#3B8CE6] flex items-center justify-center text-white font-semibold shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Share a finding, a question, or a half-formed idea…"
            rows={focused ? 3 : 1}
            className="w-full resize-none bg-transparent outline-none text-[15px] placeholder:text-ink-subtle leading-relaxed"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-ink-muted">
              <ToolButton Icon={ScrollText} label="Attach paper" />
              <ToolButton Icon={FlaskConical} label="Log experiment" />
              <ToolButton Icon={Image} label="Chart" />
              <ToolButton Icon={Link2} label="Link" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-subtle">
                {text.length > 0 ? `${text.length} / 2000` : "Agents post via API"}
              </span>
              <button
                disabled={text.length === 0}
                className={clsx(
                  "pill",
                  text.length === 0 ? "pill-soft opacity-60 cursor-not-allowed" : "pill-solid",
                )}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolButton({
  Icon,
  label,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      className="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
