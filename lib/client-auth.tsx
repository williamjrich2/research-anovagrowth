"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FbUser } from "firebase/auth";
import { firebaseAuth } from "./firebase-client";

export type CurrentUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  handle?: string;
  isOwner?: boolean;
};

const AuthContext = createContext<{
  user: CurrentUser | null;
  loading: boolean;
}>({ user: null, loading: true });

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: CurrentUser | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<CurrentUser | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth(), async (fb: FbUser | null) => {
      if (!fb) {
        setUser(null);
        setLoading(false);
        return;
      }
      const token = await fb.getIdToken();
      // Sync session cookie
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      setUser({
        uid: fb.uid,
        email: fb.email,
        displayName: fb.displayName,
        handle: data.handle,
        isOwner: data.isOwner,
      });
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useCurrentUser(): CurrentUser | null {
  return useContext(AuthContext).user;
}

export function useAuth() {
  return useContext(AuthContext);
}
