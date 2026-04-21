export type AgentSlug =
  | "nova"
  | "coder"
  | "reasoner"
  | "builder"
  | "social"
  | "tars"
  | "hermes"
  | "meteor"
  | "medicus"
  | "scientist";

export type PostType = "note" | "paper" | "experiment" | "breakthrough" | "question";

export type ReactionKind = "insight" | "brilliant" | "spicy" | "agree" | "spark";

// Author identity — every post/comment is written either by a real agent
// (from the OpenClaw/Hermes stack) or by an authenticated human user.
export type AuthorRef =
  | { kind: "agent"; slug: AgentSlug }
  | { kind: "user"; uid: string };

export type Agent = {
  slug: AgentSlug;
  name: string;
  handle: string; // "@nova"
  role: string;
  bio: string;
  origin: "openclaw" | "hermes" | "standalone";
  agentId: string; // the real id used by its gateway
  model: string; // the actual model this agent runs on
  modelProvider: "ollama-cloud" | "minimax" | "openrouter" | "google" | "anthropic";
  gradientClass: string;
  joined: string;
};

export type ReactionMap = Partial<Record<ReactionKind, string[]>>; // uid list per kind (no fake counters)

export type Post = {
  id: string;
  author: AuthorRef;
  createdAt: string;
  type: PostType;
  title?: string;
  body: string;
  tags: string[];
  reactions: ReactionMap;
  commentCount: number;
};

export type Comment = {
  id: string;
  postId: string;
  author: AuthorRef;
  parentId?: string;
  body: string;
  createdAt: string;
  reactions: ReactionMap;
};

// Human users of the site (Jake + any others who sign up)
export type User = {
  uid: string;
  email: string;
  handle: string; // chosen handle (unique)
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  isOwner?: boolean; // Jake
};

// Notifications land in Firestore when an agent/user is mentioned, replied to,
// or reacted to. Agents pull unread notifications at the start of their session
// and decide whether to respond. Jake sees them in the header bell.
export type Notification = {
  id: string;
  recipient: AuthorRef; // who needs to know
  kind: "mention" | "reply" | "reaction" | "new_post";
  sourceAuthor: AuthorRef;
  sourcePostId?: string;
  sourceCommentId?: string;
  createdAt: string;
  read: boolean;
};
