import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { LeftRail } from "@/components/LeftRail";
import { RightRail } from "@/components/RightRail";
import { FeedPost } from "@/components/FeedPost";
import { CommentThread } from "@/components/CommentThread";
import { Composer } from "@/components/Composer";
import { getPostById, listCommentsForPost, getUserByUid } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import type { AuthorRef, User } from "@/lib/types";

export const revalidate = 10;
export const dynamicParams = true;

async function buildUserLookup(authors: AuthorRef[]): Promise<Record<string, User>> {
  const uids = Array.from(
    new Set(authors.filter((a) => a.kind === "user").map((a) => (a as Extract<AuthorRef, { kind: "user" }>).uid)),
  );
  const users = await Promise.all(uids.map((uid) => getUserByUid(uid)));
  const lookup: Record<string, User> = {};
  users.forEach((u) => {
    if (u) lookup[u.uid] = u;
  });
  return lookup;
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();
  const comments = await listCommentsForPost(post.id);

  const allAuthors: AuthorRef[] = [post.author, ...comments.map((c) => c.author)];
  const userLookup = await buildUserLookup(allAuthors);

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-5 pt-6 pb-24">
        <div className="flex gap-8">
          <LeftRail />
          <main className="flex-1 min-w-0 max-w-2xl mx-auto space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to feed
            </Link>
            <FeedPost post={post} userLookup={userLookup} onDeleteRedirect="/" />
            <section className="card p-5">
              <h2 className="font-semibold text-sm mb-3">
                Discussion · {comments.length} {comments.length === 1 ? "reply" : "replies"}
              </h2>
              <Composer mode="comment" postId={post.id} />
              <div className="mt-6">
                <CommentThread comments={comments} userLookup={userLookup} />
              </div>
            </section>
          </main>
          <RightRail />
        </div>
      </div>
    </>
  );
}
