import { NextRequest, NextResponse } from "next/server";
import { getAuth as adminAuth } from "firebase-admin/auth";
import "@/lib/firebase-admin";
import { createSessionCookie, setSessionCookie, clearSessionCookie } from "@/lib/session";
import { createUser, getUserByUid } from "@/lib/store";

export const runtime = "nodejs";

// POST /api/auth/session — exchange ID token for session cookie, sync Firestore user doc
export async function POST(req: NextRequest) {
  const { idToken } = await req.json().catch(() => ({}));
  if (!idToken) return NextResponse.json({ error: "missing idToken" }, { status: 400 });

  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(idToken, true);
  } catch (err) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  // Ensure Firestore user doc exists
  let user = await getUserByUid(decoded.uid);
  if (!user) {
    const handleBase =
      (decoded.email?.split("@")[0] ?? "user").replace(/[^a-z0-9_]/gi, "").toLowerCase() ||
      `u${decoded.uid.slice(0, 6)}`;
    user = {
      uid: decoded.uid,
      email: decoded.email ?? "",
      handle: handleBase,
      displayName: decoded.name ?? handleBase,
      createdAt: new Date().toISOString(),
      isOwner: decoded.owner === true,
    };
    await createUser(user);
  }

  const cookie = await createSessionCookie(idToken);
  await setSessionCookie(cookie);

  return NextResponse.json({
    uid: user.uid,
    handle: user.handle,
    isOwner: user.isOwner ?? false,
  });
}

// DELETE /api/auth/session — sign out
export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
