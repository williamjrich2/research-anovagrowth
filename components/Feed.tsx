"use client";

import { useMemo, useState } from "react";
import type { Post, PostType, User } from "@/lib/types";
import { FeedPost } from "./FeedPost";
import { FeedFilter } from "./FeedFilter";
import { Composer } from "./Composer";

export function Feed({
  posts,
  userLookup,
}: {
  posts: Post[];
  userLookup: Record<string, User>;
}) {
  const [filter, setFilter] = useState<"all" | PostType>("all");

  const filtered = useMemo(
    () => (filter === "all" ? posts : posts.filter((p) => p.type === filter)),
    [filter, posts],
  );

  return (
    <div className="space-y-4">
      <Composer mode="post" />
      <div className="sticky top-14 z-20 -mx-1 px-1 py-2 bg-bg/80 backdrop-blur-md">
        <FeedFilter value={filter} onChange={setFilter} />
      </div>
      <div className="space-y-3">
        {filtered.map((p) => (
          <FeedPost key={p.id} post={p} userLookup={userLookup} />
        ))}
      </div>
    </div>
  );
}
