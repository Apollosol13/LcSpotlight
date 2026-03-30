"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionWithoutRole, setSessionWithoutRole] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    let cancelled = false;
    const client = createSupabaseBrowser();
    (async () => {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (cancelled || !user) return;
      const { data: roleRow } = await client
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      const role = roleRow?.role;
      if (role === "business" || role === "admin") {
        router.replace(role === "business" ? "/business" : "/admin");
        return;
      }
      setSessionWithoutRole(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Could not load session.");
      setLoading(false);
      return;
    }

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const role = roleRow?.role;
    const allowed = role === "business" || role === "admin";

    if (!allowed) {
      await supabase.auth.signOut();
      setError("This account does not have portal access. Contact LCSpotlight.");
      setLoading(false);
      return;
    }

    const isPartnerOnly = role === "business";
    router.push(isPartnerOnly ? "/business" : "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl text-white">
            LC<span className="text-spotlight-gold">Spotlight</span>
          </h1>
          <p className="mt-2 text-sm text-white/50">Staff &amp; business sign in</p>
          <p className="mt-2 text-xs text-white/35">
            One login. Staff see site admin + your listings; partners see listings only.
          </p>
        </div>

        {sessionWithoutRole ? (
          <div className="mb-5 space-y-3 rounded border border-amber-500/25 bg-amber-500/10 px-3 py-3 text-sm text-amber-200/90">
            <p>
              You are signed in, but this account is not assigned a partner or staff role yet.
            </p>
            <button
              type="button"
              onClick={() =>
                void (async () => {
                  await supabase.auth.signOut();
                  setSessionWithoutRole(false);
                  router.refresh();
                })()
              }
              className="w-full rounded border border-white/15 bg-white/5 py-2 text-xs font-medium text-white transition hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        ) : null}

        <form onSubmit={(e) => void handleLogin(e)} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-spotlight-gold"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-spotlight-gold"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-spotlight-gold py-2.5 text-sm font-semibold text-black transition hover:bg-spotlight-gold-light disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
