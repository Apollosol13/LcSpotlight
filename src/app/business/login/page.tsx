"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function BusinessLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowser();

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
    const canUseBusinessPortal =
      role === "business" || role === "admin" || role === undefined;

    if (!canUseBusinessPortal) {
      await supabase.auth.signOut();
      setError("This account cannot use the business portal. Contact LCSpotlight for access.");
      setLoading(false);
      return;
    }

    router.push("/business");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl text-white">
            LC<span className="text-spotlight-gold">Spotlight</span>
          </h1>
          <p className="mt-2 text-sm text-white/50">Business portal</p>
        </div>

        <form onSubmit={(e) => void handleLogin(e)} className="space-y-5">
          <div>
            <label
              htmlFor="biz-email"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60"
            >
              Email
            </label>
            <input
              id="biz-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-spotlight-gold"
              placeholder="you@yourbusiness.com"
            />
          </div>

          <div>
            <label
              htmlFor="biz-password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60"
            >
              Password
            </label>
            <input
              id="biz-password"
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

        <p className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/35">
          Staff?{" "}
          <Link href="/admin/login" className="text-spotlight-gold no-underline hover:underline">
            Admin sign-in
          </Link>
        </p>
      </div>
    </div>
  );
}
