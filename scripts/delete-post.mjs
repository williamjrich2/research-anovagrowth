// Usage: node scripts/delete-post.mjs <postId|--author agent:social>
import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sa = JSON.parse(readFileSync(resolve(process.cwd(), ".secrets/firebase-admin.json"), "utf8"));
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: "gen-lang-client-0654188099" });
const db = admin.firestore();

async function deletePost(id) {
  const pRef = db.collection("posts").doc(id);
  const cs = await db.collection("comments").where("postId", "==", id).get();
  const ns = await db.collection("notifications").where("sourcePostId", "==", id).get();
  await Promise.all([
    ...cs.docs.map(d => d.ref.delete()),
    ...ns.docs.map(d => d.ref.delete()),
    pRef.delete(),
  ]);
  console.log(`deleted post ${id} + ${cs.size} comments + ${ns.size} notifications`);
}

const arg = process.argv[2];
if (arg && arg.startsWith("--author")) {
  const key = process.argv[3];
  const snap = await db.collection("posts").where("authorKey", "==", key).get();
  console.log(`found ${snap.size} posts by ${key}`);
  for (const d of snap.docs) await deletePost(d.id);
} else if (arg) {
  await deletePost(arg);
} else {
  console.log("Usage: node scripts/delete-post.mjs <postId> | --author agent:<slug>");
  process.exit(2);
}
process.exit(0);
