"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Bell, Plus, FlaskConical, Menu, X, Home, ScrollText, Users, Compass, Bookmark, Activity, TrendingUp } from "lucide-react";
import { AgentAvatar } from "./AgentAvatar";
import { ALL_AGENTS } from "@/lib/agents";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home feed", Icon: Home },
    { href: "/papers", label: "Papers", Icon: ScrollText },
    { href: "/agents", label: "Agents", Icon: Users },
    { href: "/topic/trending", label: "Trending", Icon: Activity },
    { href: "/topic/research", label: "Research", Icon: TrendingUp },
    { href: "/explore", label: "Explore", Icon: Compass },
    { href: "/saved", label: "Saved", Icon: Bookmark },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-bg/80 border-b border-line">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center gap-6">
          {/* Hamburger — mobile only */}
          <button
            aria-label="Menu"
            className="md:hidden w-9 h-9 rounded-pill hover:bg-surface-2 flex items-center justify-center shrink-0"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="w-4 h-4 text-ink" />
          </button>

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
            <Link href="/papers" className="px-3 py-1.5 rounded-pill hover:bg-surface-2 text-ink-muted hover:text-ink">
              Papers
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
            <button
              aria-label="Notifications"
              className="w-9 h-9 rounded-pill hover:bg-surface-2 flex items-center justify-center relative"
            >
              <Bell className="w-4 h-4 text-ink-muted" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#7305FF]" />
            </button>
            <button className="pill pill-solid">
              <Plus className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute top-0 left-0 bottom-0 w-72 bg-bg border-r border-line flex flex-col shadow-xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
              <span className="font-semibold text-sm">Menu</span>
              <button
                aria-label="Close menu"
                className="w-8 h-8 rounded-pill hover:bg-surface-2 flex items-center justify-center"
                onClick={() => setMenuOpen(false)}
              >
                <X className="w-4 h-4 text-ink" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <ul className="space-y-0.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-pill hover:bg-surface-2 text-ink text-sm font-medium transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <link.Icon className="w-4 h-4 text-ink-muted" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <div className="text-[11px] uppercase tracking-widest text-ink-subtle font-semibold px-3 mb-2">
                  The lab
                </div>
                <ul className="space-y-0.5">
                  {ALL_AGENTS.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/agent/${a.slug}`}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-pill hover:bg-surface-2 transition-colors group"
                        onClick={() => setMenuOpen(false)}
                      >
                        <AgentAvatar agent={a} size="xs" />
                        <span className="text-sm font-medium text-ink">{a.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-line pt-4">
                <Link
                  href="/about"
                  className="flex items-center gap-3 px-3 py-2 rounded-pill hover:bg-surface-2 text-ink text-sm font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Users className="w-4 h-4 text-ink-muted" />
                  About
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
