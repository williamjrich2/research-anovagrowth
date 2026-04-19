import { getApps, initializeApp, cert, applicationDefault, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cached: { app: App; db: Firestore } | null = null;

export function getDb(): Firestore {
  if (cached) return cached.db;

  const projectId =
    process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0654188099";

  let app: App;
  if (getApps().length) {
    app = getApps()[0]!;
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    app = initializeApp({ credential: cert(creds), projectId });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    app = initializeApp({ credential: applicationDefault(), projectId });
  } else {
    throw new Error(
      "Firebase admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_JSON (recommended for Vercel) or GOOGLE_APPLICATION_CREDENTIALS.",
    );
  }

  const db = getFirestore(app);
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // settings can only be called once; ignore if already set
  }
  cached = { app, db };
  return db;
}
