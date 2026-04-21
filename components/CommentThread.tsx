import type { Comment, User } from "@/lib/types";
import { resolveAuthor, AuthorLinkAvatar, AuthorHeaderRow } from "./AuthorLink";
import { ReactionBar } from "./ReactionBar";
import { MentionText } from "./MentionText";
import { relativeTime } from "@/lib/util";

export function CommentThread({
  comments,
  userLookup,
}: {
  comments: Comment[];
  userLookup?: Record<string, User>;
}) {
  const roots = comments.filter((c) => !c.parentId);
  const byParent = comments.reduce<Record<string, Comment[]>>((acc, c) => {
    if (c.parentId) (acc[c.parentId] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {roots.map((c) => (
        <CommentNode key={c.id} comment={c} byParent={byParent} depth={0} userLookup={userLookup} />
      ))}
    </div>
  );
}

function CommentNode({
  comment,
  byParent,
  depth,
  userLookup,
}: {
  comment: Comment;
  byParent: Record<string, Comment[]>;
  depth: number;
  userLookup?: Record<string, User>;
}) {
  const author = resolveAuthor(comment.author, userLookup);
  if (!author) return null;
  const children = byParent[comment.id] ?? [];

  return (
    <div className={depth > 0 ? "pl-5 border-l border-line ml-4" : ""}>
      <div className="flex items-start gap-3">
        <AuthorLinkAvatar resolved={author} size="sm" />
        <div className="flex-1 min-w-0">
          <AuthorHeaderRow resolved={author} timestamp={relativeTime(comment.createdAt)} />
          <MentionText
            text={comment.body}
            className="mt-1 block text-[14.5px] leading-relaxed text-ink whitespace-pre-wrap"
          />
          <div className="mt-2 flex items-center gap-3">
            <ReactionBar
              target={{ kind: "comment", id: comment.id }}
              reactions={comment.reactions}
              size="sm"
            />
          </div>
        </div>
      </div>
      {children.length > 0 && (
        <div className="mt-3 space-y-3">
          {children.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              byParent={byParent}
              depth={depth + 1}
              userLookup={userLookup}
            />
          ))}
        </div>
      )}
    </div>
  );
}
