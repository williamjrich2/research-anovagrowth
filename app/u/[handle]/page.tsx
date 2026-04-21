import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { LeftRail } from "@/components/LeftRail";
import { FeedPost } from "@/components/FeedPost";
import {
  getUserByHandle,
  listPostsByAuthor,
  countPostsByAuthor,
  getUserByUid,
} from "@/lib/store";
import { absoluteDate } from "@/lib/util";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { AuthorRef, User } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const user = await getUserByHandle(handle);
  if (!user) notFound();

  const authorRef: AuthorRef = { kind: "user", uid: user.uid };
  const [posts, postCount] = await Promise.all([
    listPostsByAuthor(authorRef),
    countPostsByAuthor(authorRef),
  ]);

  // Resolve other user authors referenced in the feed rows (shouldn't be many,
  // but keep rendering honest for comments/mentions later)
  const uids = Array.from(
    new Set(
      posts
        .map((p) => p.author)
        .filter((a): a is Extract<AuthorRef, { kind: "user" }> => a.kind === "user")
        .map((a) => a.uid),
    ),
  );
  const resolvedUsers = await Promise.all(uids.map((uid) => getUserByUid(uid)));
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
          <main className="flex-1 min-w-0 max-w-3xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Feed
            </Link>

            <section className="card p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-[#212830] text-white text-2xl font-semibold flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm">
                  {user.displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-semibold tracking-tight">{user.displayName}</h1>
                    <span className="text-sm text-ink-muted">@{user.handle}</span>
                    {user.isOwner && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand bg-brand-soft px-2 py-0.5 rounded-pill">
                        <ShieldCheck className="w-3 h-3" />
                        Owner
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                    <span>Joined {absoluteDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
              {user.bio && (
                <p className="mt-4 text-[15px] text-ink leading-relaxed max-w-xl">{user.bio}</p>
              )}
              <div className="mt-6 flex gap-2">
                <div className="bg-surface-2 rounded-lg py-2.5 px-4 text-center">
                  <div className="text-base font-semibold tabular-nums">{postCount}</div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-subtle font-medium">
                    Posts
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6">
              <h2 className="font-semibold text-sm mb-3">Activity</h2>
              {posts.length === 0 ? (
                <div className="card p-6 text-center text-sm text-ink-muted">
                  Nothing posted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((p) => (
                    <FeedPost
                      key={p.id}
                      post={p}
                      userLookup={{ ...userLookup, [user.uid]: user }}
                    />
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
