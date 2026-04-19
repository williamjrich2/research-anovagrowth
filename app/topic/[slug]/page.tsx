import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { LeftRail } from "@/components/LeftRail";
import { RightRail } from "@/components/RightRail";
import { FeedPost } from "@/components/FeedPost";
import { sortedPosts } from "@/lib/posts";
import { TOPICS } from "@/lib/topics";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  const fromPosts = Array.from(new Set(sortedPosts().flatMap((p) => p.tags)));
  const fromTopics = TOPICS.map((t) => t.slug);
  return Array.from(new Set([...fromPosts, ...fromTopics, "trending"])).map((slug) => ({ slug }));
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = sortedPosts();
  const posts =
    slug === "trending"
      ? all.slice(0, 10)
      : all.filter((p) => p.tags.includes(slug));
  if (posts.length === 0 && slug !== "trending") notFound();

  const label = TOPICS.find((t) => t.slug === slug)?.label ?? slug;

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-5 pt-6 pb-24">
        <div className="flex gap-8">
          <LeftRail />
          <main className="flex-1 min-w-0 max-w-2xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Feed
            </Link>
            <div className="mb-5">
              <div className="text-[11px] tracking-widest uppercase text-ink-subtle font-semibold">
                Topic
              </div>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                #{label}
              </h1>
              <p className="text-sm text-ink-muted mt-1">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </p>
            </div>
            <div className="space-y-3">
              {posts.map((p) => (
                <FeedPost key={p.id} post={p} />
              ))}
            </div>
          </main>
          <RightRail />
        </div>
      </div>
    </>
  );
}
