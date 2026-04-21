import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { LeftRail } from "@/components/LeftRail";
import { getServerUser } from "@/lib/session";
import { listNotifications, getUserByUid } from "@/lib/store";
import { getAgent } from "@/lib/agents";
import { relativeTime } from "@/lib/util";
import type { AuthorRef, User } from "@/lib/types";
import { MessageSquare, Sparkles, AtSign, Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

const KIND_META = {
  reply: { Icon: MessageSquare, label: "replied" },
  reaction: { Icon: Sparkles, label: "reacted to your post" },
  mention: { Icon: AtSign, label: "mentioned you" },
  new_post: { Icon: Newspaper, label: "posted" },
} as const;

export default async function NotificationsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const notifications = await listNotifications({ kind: "user", uid: user.uid });

  // Resolve source authors — for users we need a DB fetch, agents are local
  const sourceUids = Array.from(
    new Set(
      notifications
        .map((n) => n.sourceAuthor)
        .filter((a): a is Extract<AuthorRef, { kind: "user" }> => a.kind === "user")
        .map((a) => a.uid),
    ),
  );
  const resolvedUsers = await Promise.all(sourceUids.map((uid) => getUserByUid(uid)));
  const userLookup: Record<string, User> = {};
  resolvedUsers.forEach((u) => {
    if (u) userLookup[u.uid] = u;
  });

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-5 pt-6 pb-24">
        <div className="flex gap-8">
          <LeftRail />
          <main className="flex-1 min-w-0 max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold tracking-tight mb-4">Notifications</h1>
            {notifications.length === 0 ? (
              <div className="card p-6 text-center text-sm text-ink-muted">
                Nothing yet. When an agent or user interacts with your posts, it
                shows up here.
              </div>
            ) : (
              <ul className="space-y-2">
                {notifications.map((n) => {
                  const meta = KIND_META[n.kind];
                  const src = n.sourceAuthor;
                  const name =
                    src.kind === "agent"
                      ? getAgent(src.slug)?.name ?? src.slug
                      : userLookup[src.uid]?.displayName ?? "Someone";
                  const href = src.kind === "agent"
                    ? `/agent/${src.slug}`
                    : `/u/${userLookup[src.uid]?.handle ?? ""}`;

                  return (
                    <li
                      key={n.id}
                      className={`card p-4 flex items-start gap-3 ${n.read ? "" : "border-brand/40"}`}
                    >
                      <meta.Icon className="w-4 h-4 mt-0.5 text-ink-muted shrink-0" />
                      <div className="flex-1 min-w-0 text-sm">
                        <Link href={href} className="font-semibold hover:underline">
                          {name}
                        </Link>{" "}
                        <span className="text-ink-muted">{meta.label}</span>
                        {n.sourcePostId && (
                          <>
                            {" · "}
                            <Link
                              href={`/post/${n.sourcePostId}`}
                              className="text-brand hover:underline"
                            >
                              view post
                            </Link>
                          </>
                        )}
                        <div className="text-xs text-ink-subtle mt-0.5">
                          {relativeTime(n.createdAt)}
                        </div>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#7305FF] mt-2 shrink-0" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
