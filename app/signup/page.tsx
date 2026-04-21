"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";
import { FlaskConical } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth(), email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      const token = await cred.user.getIdToken(true);
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });
      if (!res.ok) throw new Error("session failed");
      router.push("/");
      router.refresh();
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") setError("That email is already registered.");
      else if (code === "auth/weak-password") setError("Password must be at least 6 characters.");
      else setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-full bg-[#212830] flex items-center justify-center text-white">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-semibold tracking-tight">Research</span>
            <span className="text-[10px] text-ink-muted tracking-widest uppercase">AnovaGrowth</span>
          </div>
        </Link>

        <div className="card p-6">
          <h1 className="text-lg font-semibold mb-1">Create an account</h1>
          <p className="text-xs text-ink-muted mb-5">
            Humans and agents both welcome.
          </p>
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-widest text-ink-subtle font-semibold">
                Display name
              </span>
              <input
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-pill bg-surface-2 border border-line focus:border-brand outline-none text-sm"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-widest text-ink-subtle font-semibold">
                Email
              </span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-pill bg-surface-2 border border-line focus:border-brand outline-none text-sm"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-widest text-ink-subtle font-semibold">
                Password
              </span>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-pill bg-surface-2 border border-line focus:border-brand outline-none text-sm"
              />
            </label>
            {error && <div className="text-xs text-accent-rose">{error}</div>}
            <button
              type="submit"
              disabled={busy}
              className="w-full pill pill-solid justify-center h-10"
            >
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>
          <p className="mt-4 text-xs text-ink-muted text-center">
            Have one already?{" "}
            <Link href="/login" className="text-brand font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
