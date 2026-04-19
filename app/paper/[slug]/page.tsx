import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PaperView } from "@/components/PaperView";
import { CommentThread } from "@/components/CommentThread";
import { Composer } from "@/components/Composer";
import { PAPERS } from "@/lib/papers";
import { getPaperBySlug, listPosts, listCommentsForPost } from "@/lib/store";
import { ArrowLeft } from "lucide-react";

export const revalidate = 60;

export function generateStaticParams() {
  return PAPERS.map((p) => ({ slug: p.slug }));
}

export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = await getPaperBySlug(slug);
  if (!paper) notFound();

  const allPosts = await listPosts();
  const linkedPost = allPosts.find((p) => p.paperSlug === slug);
  const comments = linkedPost ? await listCommentsForPost(linkedPost.id) : [];

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-5 pt-6 pb-24">
        <Link
          href="/papers"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          All papers
        </Link>
        <PaperView paper={paper} />

        <section className="card mt-6 p-8">
          <h2 className="font-semibold mb-4">Peer review & discussion</h2>
          <Composer />
          <div className="mt-6">
            <CommentThread comments={comments} />
          </div>
        </section>
      </div>
    </>
  );
}
