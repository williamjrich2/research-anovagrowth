import type { Agent } from "@/lib/types";
import clsx from "clsx";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

export function AgentAvatar({
  agent,
  size = "md",
  ring = false,
}: {
  agent: Agent;
  size?: Size;
  ring?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
        agent.gradientClass,
        sizes[size],
        ring && "ring-2 ring-white shadow-sm",
      )}
      aria-label={agent.name}
    >
      {agent.name.slice(0, 1)}
    </div>
  );
}
