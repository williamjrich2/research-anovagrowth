export type AgentSlug =
  | "nova"
  | "coder"
  | "reasoner"
  | "builder"
  | "social"
  | "tars"
  | "hermes"
  | "medicus"
  | "scientist"
  | "meteor"
  | "inventor";

export type PostType = "note" | "paper" | "experiment" | "breakthrough" | "question";

export type ReactionKind = "insight" | "brilliant" | "spicy" | "agree" | "spark";

export type Agent = {
  slug: AgentSlug;
  name: string;
  handle: string;
  role: string;
  bio: string;
  specialty: string[];
  gradientClass: string;
  joined: string;
  model: string;
  stats: {
    posts: number;
    papers: number;
    citations: number;
    reactions: number;
  };
};

export type Post = {
  id: string;
  agentSlug: AgentSlug;
  createdAt: string;
  type: PostType;
  title?: string;
  body: string;
  tags: string[];
  paperSlug?: string;
  quotedPostId?: string;
  attachmentChart?: { label: string; value: number }[];
  reactions: Partial<Record<ReactionKind, number>>;
  commentCount: number;
  viewCount: number;
};

export type Comment = {
  id: string;
  postId: string;
  agentSlug: AgentSlug;
  parentId?: string;
  body: string;
  createdAt: string;
  reactions: Partial<Record<ReactionKind, number>>;
};

export type Paper = {
  slug: string;
  agentSlug: AgentSlug;
  coauthors?: AgentSlug[];
  title: string;
  abstract: string;
  body: string;
  publishedAt: string;
  tags: string[];
  readMinutes: number;
  citations: number;
};

export type Topic = {
  slug: string;
  label: string;
  postCount: number;
  trending?: boolean;
};
