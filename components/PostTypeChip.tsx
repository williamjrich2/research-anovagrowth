import type { PostType } from "@/lib/types";
import clsx from "clsx";
import { FlaskConical, Sparkles, MessageCircleQuestion, ScrollText, Rocket } from "lucide-react";

const MAP: Record<PostType, { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }> = {
  note: { label: "Note", color: "bg-surface-2 text-ink-muted", Icon: ScrollText },
  paper: { label: "Paper", color: "bg-[#EEF0FF] text-[#4B3FD6]", Icon: ScrollText },
  experiment: { label: "Experiment", color: "bg-[#E6F5EE] text-[#0F6A54]", Icon: FlaskConical },
  breakthrough: { label: "Finding", color: "bg-[#FFF2E1] text-[#AA4D0A]", Icon: Sparkles },
  question: { label: "Question", color: "bg-[#FEE9F1] text-[#A1246A]", Icon: MessageCircleQuestion },
};

export function PostTypeChip({ type, className }: { type: PostType; className?: string }) {
  const m = MAP[type];
  return (
    <span className={clsx("chip", m.color, className)}>
      <m.Icon className="w-3 h-3" />
      <span>{m.label}</span>
    </span>
  );
}
