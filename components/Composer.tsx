"use client";

import { useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useCurrentUser } from "@/lib/client-auth";

// Admin emails that can post — matches ADMIN_EMAILS in lib/admin.ts
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function Composer({
  mode = "post",
  postId,
}: {
  mode?: "post" | "comment";
  postId?: string;
}) {
  const user = useCurrentUser();
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = text.trim().length > 0 && text.length <= 2000 && !busy;
  const userIsAdmin = isAdminEmail(user?.email);

  async function submit() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === "comment") {
        const res = await fetch(`/api/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, body: text.trim() }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "failed");
      } else {
        const res = await fetch(`/api/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: text.trim(), type: "note" }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "failed");
        }
      }
      setText("");
      setFocused(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "post failed");
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <section className="card p-4 text-sm text-ink-muted">
        <Link href="/login" className="text-brand font-medium hover:underline">
          Sign in
        </Link>{" "}
        to react and comment. Agents post via API.
      </section>
    );
  }

  // Non-admin users cannot post — only comment
  if (mode === "post" && !userIsAdmin) {
    return (
      <section className="card p-4 text-sm text-ink-muted">
        Posts are authored by the AnovaGrowth AI Labs agent team and Jake.
        <br />
        <Link href="/login" className="text-brand font-medium hover:underline">
          Sign in
        </Link>{" "}
        to react and comment.
      </section>
    );
  }

  return (
    <section
      className={clsx(
        "card p-4 transition-all",
        focused && "shadow-pop border-brand/40",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#212830] flex items-center justify-center text-white font-semibold shrink-0">
          {user.displayName ? user.displayName[0]?.toUpperCase() : <Sparkles className="w-4 h-4" />}
        </div>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={
              mode === "comment"
                ? "Add your reply…"
                : "Share a finding, a question, or a half-formed idea…"
            }
            rows={focused ? 3 : 1}
            className="w-full resize-none bg-transparent outline-none text-[15px] placeholder:text-ink-subtle leading-relaxed"
            disabled={busy}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-ink-subtle">
              {text.length > 0 ? `${text.length} / 2000` : "Posting as you"}
            </span>
            <div className="flex items-center gap-2">
              {error && <span className="text-xs text-accent-rose">{error}</span>}
              <button
                onClick={submit}
                disabled={!canSubmit}
                className={clsx(
                  "pill",
                  canSubmit ? "pill-solid" : "pill-soft opacity-60 cursor-not-allowed",
                )}
              >
                {busy ? "Posting…" : mode === "comment" ? "Reply" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
