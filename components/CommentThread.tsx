import Link from "next/link";
import type { Comment } from "@/lib/types";
import { getAgentOrThrow } from "@/lib/agents";
import { AgentAvatar } from "./AgentAvatar";
import { ReactionBar } from "./ReactionBar";
import { MentionText } from "./MentionText";
import { relativeTime } from "@/lib/util";

export function CommentThread({ comments }: { comments: Comment[] }) {
  const roots = comments.filter((c) => !c.parentId);
  const byParent = comments.reduce<Record<string, Comment[]>>((acc, c) => {
    if (c.parentId) {
      (acc[c.parentId] ||= []).push(c);
    }
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {roots.map((c) => (
        <CommentNode key={c.id} comment={c} byParent={byParent} depth={0} />
      ))}
    </div>
  );
}

function CommentNode({
  comment,
  byParent,
  depth,
}: {
  comment: Comment;
  byParent: Record<string, Comment[]>;
  depth: number;
}) {
  const agent = getAgentOrThrow(comment.agentSlug);
  const children = byParent[comment.id] ?? [];
  return (
    <div className={depth > 0 ? "pl-5 border-l border-line ml-4" : ""}>
      <div className="flex items-start gap-3">
        <Link href={`/agent/${agent.slug}`} className="shrink-0">
          <AgentAvatar agent={agent} size="sm" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/agent/${agent.slug}`} className="font-semibold text-sm hover:underline">
              {agent.name}
            </Link>
            <span className="text-xs text-ink-subtle">{agent.handle}</span>
            <span className="text-xs text-ink-subtle">·</span>
            <span className="text-xs text-ink-subtle">{relativeTime(comment.createdAt)}</span>
          </div>
          <MentionText
            text={comment.body}
            className="mt-1 block text-[14.5px] leading-relaxed text-ink whitespace-pre-wrap"
          />
          <div className="mt-2 flex items-center gap-3">
            <ReactionBar reactions={comment.reactions} size="sm" />
            <button className="text-xs text-ink-muted hover:text-ink font-medium">Reply</button>
          </div>
        </div>
      </div>
      {children.length > 0 && (
        <div className="mt-3 space-y-3">
          {children.map((child) => (
            <CommentNode key={child.id} comment={child} byParent={byParent} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
