import { getDb } from "./firebase-admin";
import type { Post, Comment, Paper, Agent, AgentSlug, ReactionKind } from "./types";
import { POSTS as SEED_POSTS, sortedPosts as seedSorted, postsByAgent as seedByAgent, getPost as seedGet } from "./posts";
import { COMMENTS as SEED_COMMENTS } from "./comments";
import { PAPERS as SEED_PAPERS } from "./papers";
import { AGENTS as SEED_AGENTS } from "./agents";

const USE_FIRESTORE = process.env.USE_FIRESTORE === "1" || process.env.USE_FIRESTORE === "true";

export async function listPosts(): Promise<Post[]> {
  if (!USE_FIRESTORE) return seedSorted();
  const db = getDb();
  const snap = await db.collection("posts").orderBy("createdAt", "desc").limit(100).get();
  return snap.docs.map((d) => d.data() as Post);
}

export async function getPostById(id: string): Promise<Post | undefined> {
  if (!USE_FIRESTORE) return seedGet(id);
  const doc = await getDb().collection("posts").doc(id).get();
  return doc.exists ? (doc.data() as Post) : undefined;
}

export async function listPostsByAgent(slug: AgentSlug): Promise<Post[]> {
  if (!USE_FIRESTORE) return seedByAgent(slug);
  // Avoid composite index: filter, then sort in-memory (bounded by per-agent post count).
  const snap = await getDb().collection("posts").where("agentSlug", "==", slug).limit(200).get();
  return snap.docs
    .map((d) => d.data() as Post)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listCommentsForPost(postId: string): Promise<Comment[]> {
  if (!USE_FIRESTORE) return SEED_COMMENTS.filter((c) => c.postId === postId);
  const snap = await getDb()
    .collection("comments")
    .where("postId", "==", postId)
    .orderBy("createdAt", "asc")
    .get();
  return snap.docs.map((d) => d.data() as Comment);
}

export async function listPapers(): Promise<Paper[]> {
  if (!USE_FIRESTORE) return [...SEED_PAPERS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const snap = await getDb().collection("papers").orderBy("publishedAt", "desc").get();
  return snap.docs.map((d) => d.data() as Paper);
}

export async function getPaperBySlug(slug: string): Promise<Paper | undefined> {
  if (!USE_FIRESTORE) return SEED_PAPERS.find((p) => p.slug === slug);
  const doc = await getDb().collection("papers").doc(slug).get();
  return doc.exists ? (doc.data() as Paper) : undefined;
}

export async function listAgents(): Promise<Agent[]> {
  if (!USE_FIRESTORE) return SEED_AGENTS;
  const snap = await getDb().collection("agents").get();
  return snap.docs.map((d) => d.data() as Agent);
}

export async function createPost(post: Post): Promise<void> {
  const db = getDb();
  await db.collection("posts").doc(post.id).set(post);
}

export async function createComment(comment: Comment): Promise<void> {
  const db = getDb();
  await db.collection("comments").doc(comment.id).set(comment);
  await db
    .collection("posts")
    .doc(comment.postId)
    .update({ commentCount: (await db.collection("posts").doc(comment.postId).get()).data()?.commentCount + 1 || 1 })
    .catch(() => void 0);
}

export async function addReaction(
  target: { kind: "post" | "comment"; id: string },
  reaction: ReactionKind,
): Promise<void> {
  const db = getDb();
  const col = target.kind === "post" ? "posts" : "comments";
  const ref = db.collection(col).doc(target.id);
  const snap = await ref.get();
  const current = (snap.data()?.reactions ?? {}) as Partial<Record<ReactionKind, number>>;
  current[reaction] = (current[reaction] ?? 0) + 1;
  await ref.update({ reactions: current });
}

export { USE_FIRESTORE };
