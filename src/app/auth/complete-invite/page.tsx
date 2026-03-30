"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { exchangePkceCodeOnce } from "@/lib/exchange-pkce-once";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

type Phase = "loading" | "ready" | "error" | "redirecting";

function parseOAuthErrorFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const h = window.location.hash;
  if (!h || h.length < 2) return null;
  const q = new URLSearchParams(h.slice(1));
  return q.get("error_description") || q.get("error");
}

function formatOAuthError(raw: string): string {
  const normalized = raw.replace(/\+/g, " ");
  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized;
  }
}

export default function CompleteInvitePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const client = createSupabaseBrowser();

    function applySessionFromUser(u: { email?: string | null }): void {
      if (cancelled) return;
      setEmail(u.email ?? null);
      setPhase("ready");
    }

    async function revealSession(): Promise<boolean> {
      const {
        data: { session },
      } = await client.auth.getSession();
      if (session?.user) {
        applySessionFromUser(session.user);
        return true;
      }
      const {
        data: { user },
      } = await client.auth.getUser();
      if (user) {
        applySessionFromUser(user);
        return true;
      }
      return false;
    }

    async function waitForSession(maxAttempts = 16, delayMs = 200): Promise<boolean> {
      for (let i = 0; i < maxAttempts; i++) {
        if (cancelled) return false;
        if (await revealSession()) return true;
        await new Promise((r) => setTimeout(r, delayMs));
      }
      return false;
    }

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (
        session?.user &&
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")
      ) {
        applySessionFromUser(session.user);
      }
    });

    void (async () => {
      if (await revealSession()) return;

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const inviteHadCode = params.has("code");
        const fromHash = parseOAuthErrorFromHash();
        const errDesc = params.get("error_description") || params.get("error") || fromHash;
        if (errDesc) {
          if (!cancelled) {
            setErrorMessage(formatOAuthError(errDesc));
            setPhase("error");
          }
          return;
        }

        const code = params.get("code");
        if (code) {
          const { error } = await exchangePkceCodeOnce(client, code);
          if (error) {
            if (!cancelled) {
              setErrorMessage(error.message);
              setPhase("error");
            }
            return;
          }
          if (await waitForSession()) return;
        } else {
          await new Promise((r) => setTimeout(r, 300));
          if (await waitForSession(10, 250)) return;
        }

        if (!cancelled) {
          setErrorMessage(
            !inviteHadCode
              ? "Open this page from the invitation link in your email (it contains a one-time code). If you bookmarked this page, that won’t work. You can also try Sign in below if you already finished setup."
              : "We couldn’t finish signing you in (the link may have expired or been used twice). Ask for a new invite or sign in if you already set up your account.",
          );
          setPhase("error");
        }
        return;
      }

      if (!cancelled) {
        setErrorMessage(
          "Open this page from the invitation link in your email, or go to Sign in if you already have an account.",
        );
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function redirectByRole(): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("Session expired. Open the invite link again or sign in.");
      setPhase("error");
      return false;
    }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    const role = roleRow?.role;
    if (role === "business") {
      router.replace("/business");
      router.refresh();
      return true;
    }
    if (role === "admin") {
      router.replace("/admin");
      router.refresh();
      return true;
    }
    await supabase.auth.signOut();
    setErrorMessage("This account does not have portal access yet. Contact LCSpotlight.");
    setPhase("error");
    return false;
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (password !== confirm) {
      setFormError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setFormError("Use at least 6 characters.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setFormError(error.message);
      setSubmitting(false);
      return;
    }
    setPhase("redirecting");
    const ok = await redirectByRole();
    if (!ok) setSubmitting(false);
  }

  async function handleContinueWithoutNewPassword() {
    setFormError(null);
    setPhase("redirecting");
    const ok = await redirectByRole();
    if (!ok) return;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl text-white">
            LC<span className="text-spotlight-gold">Spotlight</span>
          </h1>
          <p className="mt-2 text-sm text-white/50">Finish your account</p>
          <p className="mt-2 text-xs text-white/35">
            You were invited to the partner portal. Set a password to sign in next time, then we&apos;ll
            open your dashboard.
          </p>
        </div>

        {phase === "loading" ? (
          <p className="text-center text-sm text-white/45">Confirming your invite…</p>
        ) : null}

        {phase === "error" && errorMessage ? (
          <div className="space-y-4">
            <p className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-400">{errorMessage}</p>
            <Link
              href="/login"
              className="block w-full rounded border border-white/10 bg-white/5 py-2.5 text-center text-sm font-medium text-white no-underline transition hover:bg-white/10"
            >
              Go to sign in
            </Link>
          </div>
        ) : null}

        {phase === "ready" ? (
          <div className="space-y-5">
            {email ? (
              <p className="text-center text-xs text-white/45">
                Signed in as <span className="text-white/70">{email}</span>
              </p>
            ) : null}

            <form onSubmit={(e) => void handleSetPassword(e)} className="space-y-4">
              <div>
                <label
                  htmlFor="invite-password"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60"
                >
                  Choose password
                </label>
                <input
                  id="invite-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full rounded border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-spotlight-gold"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label
                  htmlFor="invite-confirm"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60"
                >
                  Confirm password
                </label>
                <input
                  id="invite-confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full rounded border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-spotlight-gold"
                  placeholder="Repeat password"
                />
              </div>
              {formError ? (
                <p className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-400">{formError}</p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded bg-spotlight-gold py-2.5 text-sm font-semibold text-black transition hover:bg-spotlight-gold-light disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Save password & continue"}
              </button>
            </form>

            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleContinueWithoutNewPassword()}
              className="w-full rounded border border-white/10 py-2.5 text-sm text-white/55 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              I already have a password — go to dashboard
            </button>

            <p className="text-center text-[11px] text-white/30">
              <Link href="/login" className="text-spotlight-gold/80 no-underline hover:underline">
                Staff sign-in
              </Link>
            </p>
          </div>
        ) : null}

        {phase === "redirecting" ? (
          <p className="text-center text-sm text-white/45">Opening your portal…</p>
        ) : null}
      </div>
    </div>
  );
}
