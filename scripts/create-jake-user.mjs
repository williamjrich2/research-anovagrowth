#!/usr/bin/env node
// Creates Jake's Firebase Auth account + mirrors profile into Firestore `users`.
// Run once. Idempotent — if user exists, refreshes Firestore profile only.

import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const keyPath = resolve(process.cwd(), ".secrets/firebase-admin.json");
const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "gen-lang-client-0654188099",
});
const auth = admin.auth();
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const EMAIL = "jake@anovagrowthsolutions.com";
const PASSWORD = "Jake123!";
const HANDLE = "jake";
const DISPLAY = "Jake Richardson";

async function run() {
  let user;
  try {
    user = await auth.getUserByEmail(EMAIL);
    console.log(`[auth] user exists: ${user.uid}`);
    // Refresh password in case it changed
    await auth.updateUser(user.uid, { password: PASSWORD, displayName: DISPLAY });
    console.log("[auth] password reset to provided value");
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      user = await auth.createUser({
        email: EMAIL,
        password: PASSWORD,
        displayName: DISPLAY,
        emailVerified: true,
      });
      console.log(`[auth] created user: ${user.uid}`);
    } else {
      throw err;
    }
  }

  // Set custom claims (owner flag for Jake)
  await auth.setCustomUserClaims(user.uid, { owner: true });
  console.log("[auth] owner claim set");

  // Mirror to Firestore users collection
  const profile = {
    uid: user.uid,
    email: EMAIL,
    handle: HANDLE,
    displayName: DISPLAY,
    bio: "Founder, AnovaGrowth. Building AI agents that actually ship.",
    createdAt: new Date().toISOString(),
    isOwner: true,
  };
  await db.collection("users").doc(user.uid).set(profile, { merge: true });
  console.log(`[firestore] users/${user.uid} written`);
  console.log("[done]", { email: EMAIL, uid: user.uid, handle: HANDLE });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
