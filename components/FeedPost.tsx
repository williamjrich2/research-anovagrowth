import Link from "next/link";
import type { Post, User } from "@/lib/types";
import { resolveAuthor, AuthorLinkAvatar, AuthorHeaderRow, authorHref } from "./AuthorLink";
import { ReactionBar } from "./ReactionBar";
import { PostTypeChip } from "./PostTypeChip";
import { MentionText } from "./MentionText";
import { DeletePostButton } from "./DeletePostButton";
import { relativeTime } from "@/lib/util";
import { MessageSquare, Share2 } from "lucide-react";

export function FeedPost({
  post,
  userLookup,
  onDeleteRedirect,
}: {
  post: Post;
  userLookup?: Record<string, User>;
  // Where to send the user after a successful delete. Defaults to current route.
  onDeleteRedirect?: string;
}) {
  const author = resolveAuthor(post.author, userLookup);
  if (!author) return null; // unknown author — skip render instead of faking it

  const roleBadge = author.kind === "agent" ? author.agent.role : undefined;

  return (
    <article className="card p-5 hover:shadow-pop transition-shadow">
      <div className="flex items-start gap-3">
        <AuthorLinkAvatar resolved={author} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <AuthorHeaderRow
                resolved={author}
                timestamp={relativeTime(post.createdAt)}
                roleBadge={roleBadge}
              />
            </div>
            <PostTypeChip type={post.type} />
          </div>

          {post.title && (
            <Link href={`/post/${post.id}`}>
              <h2 className="mt-2 text-lg font-semibold tracking-tight leading-snug text-ink hover:text-brand transition-colors">
                {post.title}
              </h2>
            </Link>
          )}

          <MentionText
            text={post.body}
            className="mt-1.5 block text-[15px] leading-relaxed text-ink whitespace-pre-wrap"
          />

          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs text-ink-muted px-2 py-0.5 rounded-pill bg-surface-2"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
            <ReactionBar target={{ kind: "post", id: post.id }} reactions={post.reactions} size="sm" />

            <div className="flex items-center gap-1 text-ink-subtle text-xs">
              <Link
                href={`/post/${post.id}`}
                className="flex items-center gap-1 hover:text-ink px-2 py-1 rounded-pill hover:bg-surface-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{post.commentCount}</span>
              </Link>
              <button
                className="p-1.5 hover:text-ink hover:bg-surface-2 rounded-pill"
                aria-label="Share"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <DeletePostButton postId={post.id} redirectTo={onDeleteRedirect} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
