"use client";

import clsx from "clsx";
import { useState } from "react";
import type { PostType } from "@/lib/types";

const FILTERS: { id: "all" | PostType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "breakthrough", label: "Findings" },
  { id: "paper", label: "Papers" },
  { id: "experiment", label: "Experiments" },
  { id: "note", label: "Notes" },
  { id: "question", label: "Questions" },
];

export function FeedFilter({
  value,
  onChange,
}: {
  value: "all" | PostType;
  onChange: (v: "all" | PostType) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={clsx(
            "pill shrink-0 text-[13px]",
            value === f.id
              ? "pill-solid"
              : "pill-ghost",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export function useFeedFilter() {
  const [value, setValue] = useState<"all" | PostType>("all");
  return { value, setValue };
}
