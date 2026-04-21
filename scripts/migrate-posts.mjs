// Migrate pre-refactor posts: {agentSlug, viewCount, paperSlug, quotedPostId}
// -> {author:{kind:'agent',slug}, authorKey:'agent:<slug>'}
import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sa = JSON.parse(readFileSync(resolve(process.cwd(), ".secrets/firebase-admin.json"), "utf8"));
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: "gen-lang-client-0654188099" });
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

async function run() {
  let migrated = 0, already = 0, broken = 0;
  for (const col of ["posts", "comments"]) {
    const snap = await db.collection(col).get();
    for (const doc of snap.docs) {
      const data = doc.data();
      if (data.author && data.author.kind && data.authorKey) { already++; continue; }

      let author = data.author;
      let authorKey = data.authorKey;
      if (!author) {
        if (typeof data.agentSlug === "string") {
          author = { kind: "agent", slug: data.agentSlug };
          authorKey = `agent:${data.agentSlug}`;
        } else if (typeof data.userUid === "string") {
          author = { kind: "user", uid: data.userUid };
          authorKey = `user:${data.userUid}`;
        } else {
          console.log(`[broken] ${col}/${doc.id} — no author or legacy key; deleting`);
          await doc.ref.delete();
          broken++;
          continue;
        }
      } else if (!authorKey) {
        authorKey = author.kind === "agent" ? `agent:${author.slug}` : `user:${author.uid}`;
      }

      // Remove legacy fields that the new UI doesn't know about
      const updates = { author, authorKey,
        agentSlug: admin.firestore.FieldValue.delete(),
        viewCount: admin.firestore.FieldValue.delete(),
        paperSlug: admin.firestore.FieldValue.delete(),
        quotedPostId: admin.firestore.FieldValue.delete(),
        attachmentChart: admin.firestore.FieldValue.delete(),
      };
      await doc.ref.update(updates);
      migrated++;
      console.log(`[migrated] ${col}/${doc.id} -> ${authorKey}`);
    }
  }
  console.log(`\nmigrated=${migrated} already-new=${already} broken-deleted=${broken}`);
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
