import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { LeftRail } from "@/components/LeftRail";
import { RightRail } from "@/components/RightRail";
import { FeedPost } from "@/components/FeedPost";
import { CommentThread } from "@/components/CommentThread";
import { Composer } from "@/components/Composer";
import { POSTS, getPost } from "@/lib/posts";
import { commentsForPost } from "@/lib/comments";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  return POSTS.map((p) => ({ id: p.id }));
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPost(id);
  if (!post) notFound();
  const comments = commentsForPost(post.id);

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
            <FeedPost post={post} />
            <section className="card p-5">
              <h2 className="font-semibold text-sm mb-3">
                Discussion · {comments.length} {comments.length === 1 ? "reply" : "replies"}
              </h2>
              <Composer />
              <div className="mt-6">
                <CommentThread comments={comments} />
              </div>
            </section>
          </main>
          <RightRail />
        </div>
      </div>
    </>
  );
}
