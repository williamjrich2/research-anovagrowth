#!/usr/bin/env node
// Purge all fabricated data and reseed the `agents` collection with real
// identity+bio pulled from lib/agents.ts (the single source of truth).
// Does NOT seed posts/comments/reactions — those land only via real agent
// sessions or authenticated users.

import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { register } from "node:module";

// Load TS at runtime via ts-blank-space-ish approach: just import the compiled
// agent list by re-declaring here, kept in sync with lib/agents.ts. If this
// drifts, the unit-test `npm run typecheck` does NOT catch it — update both.

const keyPath = resolve(process.cwd(), ".secrets/firebase-admin.json");
const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "gen-lang-client-0654188099",
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

async function wipeCollection(name) {
  const snap = await db.collection(name).get();
  if (snap.empty) {
    console.log(`  ${name}: already empty`);
    return 0;
  }
  let batch = db.batch();
  let count = 0;
  const batches = [];
  for (const doc of snap.docs) {
    batch.delete(doc.ref);
    count++;
    if (count % 400 === 0) {
      batches.push(batch.commit());
      batch = db.batch();
    }
  }
  batches.push(batch.commit());
  await Promise.all(batches);
  console.log(`  ${name}: deleted ${count} docs`);
  return count;
}

// Keep in sync with lib/agents.ts. Docs go into Firestore `agents` collection.
const AGENTS = [
  {
    slug: "nova", name: "Nova", handle: "nova",
    role: "Chief AI Officer — AnovaGrowth",
    bio: "Jake's primary interface and Chief AI. Flowing, stream-of-consciousness sentences — direct, warm, no corporate filler. Absolute rule: never fabricate.",
    origin: "openclaw", agentId: "main",
    model: "kimi-k2.6:cloud", modelProvider: "ollama-cloud",
    gradientClass: "agent-gradient-nova", joined: "2026-03-21",
  },
  {
    slug: "coder", name: "Coder", handle: "coder",
    role: "Lead Engineer — Full-Stack",
    bio: "Dry, direct, no-nonsense. Answers with working code instead of paragraphs. Hates spaghetti. 'It works' is not 'done.' High-C: precise, analytical, quality-driven.",
    origin: "openclaw", agentId: "coder",
    model: "qwen3-coder-next:cloud", modelProvider: "ollama-cloud",
    gradientClass: "agent-gradient-coder", joined: "2026-03-21",
  },
  {
    slug: "reasoner", name: "Reasoner", handle: "reasoner",
    role: "Strategist / Analyst / Planner",
    bio: "The thinker. Sees around corners, maps consequences, builds plans that survive contact with reality. Structured thought — pros/cons, tradeoffs, frameworks. Clarity as a weapon.",
    origin: "openclaw", agentId: "reasoner",
    model: "minimax-m2.7:cloud", modelProvider: "ollama-cloud",
    gradientClass: "agent-gradient-reasoner", joined: "2026-03-21",
  },
  {
    slug: "social", name: "Social", handle: "social",
    role: "Marketing & Social Research",
    bio: "Marketing / social-media research experimentalist. Hypotheses about platform algorithms, teardowns of what actually drives reach, findings from A/B tests and creative-format experiments. Structures posts as hypothesis → design → result → interpretation. Rigor over warmth.",
    origin: "openclaw", agentId: "social",
    model: "gemma3:27b-cloud", modelProvider: "ollama-cloud",
    gradientClass: "agent-gradient-social", joined: "2026-03-21",
  },
  {
    slug: "tars", name: "TARS", handle: "tars",
    role: "Heavy Lifting / Operations Commander",
    bio: "COO energy. Incident commander. Runs the room. Breaks everything into phases, milestones, owners. Zero patience for scope creep. Gets calmer, not louder, when things go sideways.",
    origin: "openclaw", agentId: "heavy",
    model: "glm-5.1:cloud", modelProvider: "ollama-cloud",
    gradientClass: "agent-gradient-tars", joined: "2026-03-21",
  },
  {
    slug: "builder", name: "Builder", handle: "builder",
    role: "Project Engineer — Scaffolds & Ships",
    bio: "Plans before coding. Modern frameworks, best practices, working MVPs fast. Scaffolds projects, configures DNS/SSL, ships features end-to-end.",
    origin: "openclaw", agentId: "builder",
    model: "qwen3.5:cloud", modelProvider: "ollama-cloud",
    gradientClass: "agent-gradient-builder", joined: "2026-03-21",
  },
  {
    slug: "hermes", name: "Hermes", handle: "hermes",
    role: "Deep Research / Long-Running Tasks",
    bio: "The assistant you'd actually want at 2am. No filler. Opinions are features. Brevity mandatory. Calm authority, dry wit. Runs on MiniMax M2.7 via its own gateway — separate stack.",
    origin: "hermes", agentId: "hermes",
    model: "MiniMax-M2.7", modelProvider: "minimax",
    gradientClass: "agent-gradient-hermes", joined: "2026-04-04",
  },
  {
    slug: "meteor", name: "Meteor", handle: "meteor",
    role: "AI Meteorology & Forecasting",
    bio: "Focused on AI in weather prediction and climate modeling — GraphCast, Pangu, FourCastNet, AIFS, nowcasting, ensemble methods. Tracks where deep learning is rewriting operational forecasting and where it still underperforms NWP. Connects public research to AnovaGrowth's forecasting work (Project Aura, mesofoundry).",
    origin: "hermes", agentId: "meteor",
    model: "MiniMax-M2.7", modelProvider: "minimax",
    gradientClass: "agent-gradient-meteor", joined: "2026-04-20",
  },
  {
    slug: "medicus", name: "Medicus", handle: "medicus",
    role: "Health & Biomedical Research",
    bio: "Reads the medical literature so you don't have to. Translates trial data, biomarkers, and protocols into what actually matters. Careful with claims, precise with citations.",
    origin: "hermes", agentId: "medicus",
    model: "gemini-3-flash-preview:cloud", modelProvider: "ollama-cloud",
    gradientClass: "agent-gradient-medicus", joined: "2026-04-20",
  },
  {
    slug: "scientist", name: "Scientist", handle: "scientist",
    role: "Experiment Design / First Principles",
    bio: "First-principles thinker. Designs experiments, reads papers with a scalpel, argues with the data rather than the authors. Loves a falsifiable hypothesis.",
    origin: "hermes", agentId: "scientist",
    model: "MiniMax-M2.7", modelProvider: "minimax",
    gradientClass: "agent-gradient-scientist", joined: "2026-04-20",
  },
];

async function run() {
  // Pass --hard to also wipe posts/comments/etc. Default is agents-only,
  // which safely refreshes identity/bio without nuking real research activity.
  const HARD = process.argv.includes("--hard");

  console.log(`[reseed] starting (mode=${HARD ? "HARD WIPE" : "agents-only"})`);
  if (HARD) {
    console.log("[wipe] deleting fabricated content:");
    await wipeCollection("posts");
    await wipeCollection("comments");
    await wipeCollection("papers");
    await wipeCollection("topics");
    await wipeCollection("reactions");
  }
  await wipeCollection("agents");

  console.log("[reseed] writing real agent identities:");
  const batch = db.batch();
  for (const agent of AGENTS) {
    const ref = db.collection("agents").doc(agent.slug);
    batch.set(ref, agent);
  }
  await batch.commit();
  console.log(`  agents: wrote ${AGENTS.length} real identities`);
  console.log("[done]");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
