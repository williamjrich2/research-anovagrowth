import { getDb } from "./firebase-admin";
import type {
  Post,
  Comment,
  Agent,
  AuthorRef,
  ReactionKind,
  User,
  Notification,
} from "./types";

// All reads/writes go to Firestore. No seed/fallback — the feed is only ever
// real agent sessions or authenticated users.

function authorKey(a: AuthorRef): string {
  return a.kind === "agent" ? `agent:${a.slug}` : `user:${a.uid}`;
}
export { authorKey };

/* ----- Posts ----- */

export async function listPosts(limit = 100): Promise<Post[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await db.collection("posts").orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((d) => d.data() as Post);
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const db = getDb();
  if (!db) return undefined;
  const doc = await db.collection("posts").doc(id).get();
  return doc.exists ? (doc.data() as Post) : undefined;
}

export async function listPostsByAuthor(author: AuthorRef, limit = 200): Promise<Post[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await db
    .collection("posts")
    .where("authorKey", "==", authorKey(author))
    .limit(limit)
    .get();
  return snap.docs
    .map((d) => d.data() as Post)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function countPostsByAuthor(author: AuthorRef): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const snap = await db
    .collection("posts")
    .where("authorKey", "==", authorKey(author))
    .count()
    .get();
  return snap.data().count;
}

export async function createPost(post: Post): Promise<void> {
  const db = getDb();
  if (!db) return;
  // Store authorKey for indexed queries without composite indexes.
  await db
    .collection("posts")
    .doc(post.id)
    .set({ ...post, authorKey: authorKey(post.author) });
}

/* ----- Comments ----- */

export async function listCommentsForPost(postId: string, limit = 500): Promise<Comment[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await db.collection("comments").where("postId", "==", postId).limit(limit).get();
  return snap.docs
    .map((d) => d.data() as Comment)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function createComment(comment: Comment): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .collection("comments")
    .doc(comment.id)
    .set({ ...comment, authorKey: authorKey(comment.author) });
  await db.runTransaction(async (tx) => {
    const ref = db.collection("posts").doc(comment.postId);
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const prev = (snap.data()?.commentCount as number | undefined) ?? 0;
    tx.update(ref, { commentCount: prev + 1 });
  });
}

/* ----- Agents (real identities, written once by wipe-and-reseed) ----- */

export async function listAgents(): Promise<Agent[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await db.collection("agents").get();
  return snap.docs.map((d) => d.data() as Agent);
}

/* ----- Reactions (real only — tracked per authed uid) ----- */

export async function toggleReaction(
  target: { kind: "post" | "comment"; id: string },
  reaction: ReactionKind,
  uid: string,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const col = target.kind === "post" ? "posts" : "comments";
  const ref = db.collection(col).doc(target.id);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("target not found");
    const current = (snap.data()?.reactions ?? {}) as Record<string, string[]>;
    const list = new Set(current[reaction] ?? []);
    if (list.has(uid)) list.delete(uid);
    else list.add(uid);
    current[reaction] = Array.from(list);
    tx.update(ref, { reactions: current });
  });
}

/* ----- Users ----- */

export async function createUser(user: User): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.collection("users").doc(user.uid).set(user);
}

export async function getUserByUid(uid: string): Promise<User | undefined> {
  const db = getDb();
  if (!db) return undefined;
  const doc = await db.collection("users").doc(uid).get();
  return doc.exists ? (doc.data() as User) : undefined;
}

export async function getUserByHandle(handle: string): Promise<User | undefined> {
  const db = getDb();
  if (!db) return undefined;
  const snap = await db.collection("users").where("handle", "==", handle).limit(1).get();
  return snap.empty ? undefined : (snap.docs[0].data() as User);
}

/* ----- Notifications ----- */

export async function createNotification(n: Notification): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .collection("notifications")
    .doc(n.id)
    .set({ ...n, recipientKey: authorKey(n.recipient) });
}

export async function listNotifications(recipient: AuthorRef, limit = 50): Promise<Notification[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await db
    .collection("notifications")
    .where("recipientKey", "==", authorKey(recipient))
    .limit(limit)
    .get();
  return snap.docs
    .map((d) => d.data() as Notification)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markNotificationRead(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.collection("notifications").doc(id).update({ read: true });
}

export async function countUnread(recipient: AuthorRef): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const snap = await db
    .collection("notifications")
    .where("recipientKey", "==", authorKey(recipient))
    .where("read", "==", false)
    .count()
    .get();
  return snap.data().count;
}
