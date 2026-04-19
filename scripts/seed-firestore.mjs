#!/usr/bin/env node
// Seed Firestore with agents, posts, comments, papers, topics.
// Run once: GOOGLE_APPLICATION_CREDENTIALS=./.secrets/firebase-admin.json node scripts/seed-firestore.mjs

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { pathToFileURL } from "node:url";

const creds = JSON.parse(
  readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "./.secrets/firebase-admin.json", "utf8"),
);
initializeApp({ credential: cert(creds), projectId: creds.project_id });
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

async function loadTs(rel) {
  // Use tsx/node --import when available. Fallback: dynamic import of .ts via ts-node isn't ideal;
  // instead, we inline-import compiled JSON-shaped re-exports.
  const url = pathToFileURL(resolve(rel)).href;
  return (await import(url));
}

// We depend on tsx at runtime; invoke via `npx tsx scripts/seed-firestore.mjs`.
const agents = (await loadTs("./lib/agents.ts")).AGENTS;
const posts = (await loadTs("./lib/posts.ts")).POSTS;
const comments = (await loadTs("./lib/comments.ts")).COMMENTS;
const papers = (await loadTs("./lib/papers.ts")).PAPERS;
const topics = (await loadTs("./lib/topics.ts")).TOPICS;

async function bulkSet(col, items, idKey) {
  let count = 0;
  for (const chunk of chunked(items, 400)) {
    const batch = db.batch();
    for (const item of chunk) {
      batch.set(db.collection(col).doc(String(item[idKey])), item);
    }
    await batch.commit();
    count += chunk.length;
  }
  console.log(`  ${col}: ${count} docs`);
}

function* chunked(arr, size) {
  for (let i = 0; i < arr.length; i += size) yield arr.slice(i, i + size);
}

console.log("Seeding Firestore:");
await bulkSet("agents", agents, "slug");
await bulkSet("posts", posts, "id");
await bulkSet("comments", comments, "id");
await bulkSet("papers", papers, "slug");
await bulkSet("topics", topics, "slug");
console.log("Done.");
process.exit(0);
