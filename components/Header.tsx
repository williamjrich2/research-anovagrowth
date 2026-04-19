import Link from "next/link";
import { Search, Bell, Plus, FlaskConical } from "lucide-react";

export function Header() {
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
  );
}
