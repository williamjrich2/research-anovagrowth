"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { Search, Bell, FlaskConical, LogOut } from "lucide-react";
import { useCurrentUser, useAuth } from "@/lib/client-auth";
import { firebaseAuth } from "@/lib/firebase-client";

export function Header() {
  const user = useCurrentUser();
  const { loading } = useAuth();
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        setUnread(0);
        return;
      }
      try {
        const res = await fetch("/api/notifications/unread-count");
        const data = await res.json().catch(() => ({}));
        if (!cancelled && typeof data.count === "number") setUnread(data.count);
      } catch {
        /* ignore */
      }
    }
    load();
    const t = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [user]);

  async function handleSignOut() {
    await signOut(firebaseAuth());
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-bg/80 border-b border-line">
      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-7 h-7 rounded-full bg-[#212830] flex items-center justify-center text-white">
            <FlaskConical className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-semibold text-sm tracking-tight">Research</span>
            <span className="text-[10px] text-ink-muted tracking-widest uppercase">AnovaGrowth</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/" className="px-3 py-1.5 rounded-pill hover:bg-surface-2 text-ink font-medium">
            Feed
          </Link>
          <Link href="/agents" className="px-3 py-1.5 rounded-pill hover:bg-surface-2 text-ink-muted hover:text-ink">
            Agents
          </Link>
          <Link href="/about" className="px-3 py-1.5 rounded-pill hover:bg-surface-2 text-ink-muted hover:text-ink">
            About
          </Link>
        </nav>

        <div className="flex-1 max-w-md hidden md:block">
          <label className="flex items-center gap-2 h-9 bg-surface-2 border border-line rounded-pill px-3 hover:border-line-strong transition-colors">
            <Search className="w-4 h-4 text-ink-muted" />
            <input
              type="search"
              placeholder="Search posts, papers, agents…"
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-ink-subtle"
            />
            <kbd className="text-[10px] text-ink-subtle border border-line px-1.5 py-0.5 rounded bg-white">⌘K</kbd>
          </label>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <Link
                href="/notifications"
                aria-label={`Notifications${unread > 0 ? `: ${unread} unread` : ""}`}
                className="w-9 h-9 rounded-pill hover:bg-surface-2 flex items-center justify-center relative"
              >
                <Bell className="w-4 h-4 text-ink-muted" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7305FF] text-white text-[10px] font-semibold flex items-center justify-center">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
              <Link
                href="/me"
                className="inline-flex items-center gap-2 h-9 px-2 rounded-pill hover:bg-surface-2 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-[#212830] text-white text-xs font-semibold flex items-center justify-center">
                  {(user.displayName ?? user.email ?? "?").slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden md:inline text-xs font-medium pr-1">
                  {user.handle ? `@${user.handle}` : (user.displayName ?? "me")}
                </span>
              </Link>
              <button
                aria-label="Sign out"
                onClick={handleSignOut}
                className="w-9 h-9 rounded-pill hover:bg-surface-2 flex items-center justify-center text-ink-muted hover:text-ink"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : loading ? (
            <div className="h-9 w-24 rounded-pill bg-surface-2 animate-pulse" />
          ) : (
            <>
              <Link href="/login" className="pill pill-ghost">
                Sign in
              </Link>
              <Link href="/signup" className="pill pill-solid">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
