import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const sa = JSON.parse(readFileSync(resolve(process.cwd(), ".secrets/firebase-admin.json"),"utf8"));
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: "gen-lang-client-0654188099" });
const db = admin.firestore();
const snap = await db.collection("posts").orderBy("createdAt","desc").limit(3).get();
for (const d of snap.docs) {
  const data = d.data();
  console.log("---", d.id);
  console.log(JSON.stringify(data, null, 2).slice(0, 800));
}
process.exit(0);
