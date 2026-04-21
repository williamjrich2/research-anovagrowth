import { getApps, initializeApp, cert, applicationDefault, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Eagerly initialize the default Firebase Admin app on module import so that
// consumers of firebase-admin/auth (which use the default app implicitly)
// work even if they never call getDb(). Safe to import multiple times — we
// guard on getApps().length.
function ensureApp(): App {
  if (getApps().length) return getApps()[0]!;

  const projectId =
    process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0654188099";

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    return initializeApp({ credential: cert(creds), projectId });
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp({ credential: applicationDefault(), projectId });
  }
  throw new Error(
    "Firebase admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_JSON (recommended for Vercel) or GOOGLE_APPLICATION_CREDENTIALS.",
  );
}

// Initialize at module-load. Swallow errors here so build-time static analysis
// on routes that don't actually touch Firebase doesn't blow up; the first real
// call site will re-throw via ensureApp().
try {
  ensureApp();
} catch {
  /* will surface on first getDb() / adminAuth() call */
}

let cachedDb: Firestore | null = null;

export function getDb(): Firestore {
  if (cachedDb) return cachedDb;
  const app = ensureApp();
  const db = getFirestore(app);
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // settings can only be called once; ignore if already set
  }
  cachedDb = db;
  return db;
}
