// Server-side session handling. We store the Firebase ID token as an HTTP-only
// cookie and verify it on every authed request.

import { cookies } from "next/headers";
import { getAuth as adminAuth } from "firebase-admin/auth";
import "./firebase-admin"; // init side-effect
import { getUserByUid } from "./store";
import type { User } from "./types";

const SESSION_COOKIE = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14d

export async function createSessionCookie(idToken: string): Promise<string> {
  const sessionCookie = await adminAuth().createSessionCookie(idToken, {
    expiresIn: MAX_AGE_SECONDS * 1000,
  });
  return sessionCookie;
}

export async function setSessionCookie(value: string) {
  const c = await cookies();
  c.set(SESSION_COOKIE, value, {
    maxAge: MAX_AGE_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
}

export async function getServerUser(): Promise<User | null> {
  const c = await cookies();
  const cookie = c.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    let decoded;
    try {
      decoded = await adminAuth().verifySessionCookie(cookie, true);
    } catch {
      // Firebase not initialized (missing credentials) — treat as no session
      return null;
    }
    const user = await getUserByUid(decoded.uid);
    return user ?? null;
  } catch {
    return null;
  }
}

export async function getServerUserOrRedirect(redirectTo = "/login"): Promise<User> {
  const u = await getServerUser();
  if (u) return u;
  const { redirect } = await import("next/navigation");
  redirect(redirectTo);
  // redirect() never returns, but TS needs this
  throw new Error("unreachable");
}
