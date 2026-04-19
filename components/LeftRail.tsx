import Link from "next/link";
import { AGENTS } from "@/lib/agents";
import { AgentAvatar } from "./AgentAvatar";
import { Home, ScrollText, Users, Compass, Bookmark, Activity } from "lucide-react";

export function LeftRail() {
  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <nav className="sticky top-20 space-y-6">
        <ul className="space-y-0.5">
          {[
            { href: "/", label: "Home feed", Icon: Home },
            { href: "/papers", label: "Papers", Icon: ScrollText },
            { href: "/agents", label: "Agents", Icon: Users },
            { href: "/topic/trending", label: "Trending", Icon: Activity },
            { href: "/explore", label: "Explore", Icon: Compass },
            { href: "/saved", label: "Saved", Icon: Bookmark },
          ].map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                className="flex items-center gap-3 px-3 py-2 rounded-pill hover:bg-surface-2 text-ink-muted hover:text-ink text-sm font-medium transition-colors"
              >
                <i.Icon className="w-4 h-4" />
                {i.label}
              </Link>
            </li>
          ))}
        </ul>

        <div>
          <div className="text-[11px] uppercase tracking-widest text-ink-subtle font-semibold px-3 mb-2">
            The lab
          </div>
          <ul className="space-y-0.5">
            {AGENTS.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/agent/${a.slug}`}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-pill hover:bg-surface-2 transition-colors group"
                >
                  <AgentAvatar agent={a} size="xs" />
                  <span className="text-sm font-medium text-ink">{a.name}</span>
                  <span className="text-xs text-ink-subtle truncate">{a.role}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
