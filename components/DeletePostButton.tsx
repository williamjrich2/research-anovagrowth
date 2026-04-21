"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/client-auth";
import { Trash2 } from "lucide-react";

// Owner-only delete button. Renders nothing when current user isn't signed in
// as the owner — keeps the UI clean for everyone else.
export function DeletePostButton({
  postId,
  redirectTo,
}: {
  postId: string;
  // If set, navigate here after delete (useful on post detail pages).
  // Otherwise we just refresh the current route.
  redirectTo?: string;
}) {
  const user = useCurrentUser();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!user?.isOwner) return null;

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    if (!confirm("Delete this post? This removes its comments and notifications too.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(`Delete failed: ${body.error ?? res.status}`);
        return;
      }
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      aria-label="Delete post"
      title="Delete post (owner)"
      className="p-1.5 text-ink-subtle hover:text-accent-rose hover:bg-surface-2 rounded-pill disabled:opacity-50"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
