"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { SubscriptionRow } from "@/lib/subscription";

export default function MemberPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [sub, setSub] = useState<SubscriptionRow | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/member/login";
        return;
      }
      setEmail(user.email ?? null);

      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setSub(data as SubscriptionRow | null);
      setLoading(false);
    })();
  }, [supabase]);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/customer-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // ignore
    }
    setPortalLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotlight-gold border-t-transparent" />
      </main>
    );
  }

  const isActive =
    sub &&
    (sub.status === "active" ||
      sub.status === "trialing" ||
      sub.status === "comped");

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-5 py-16">
      <h1 className="mb-2 font-serif text-2xl font-bold text-spotlight-navy">
        Your Membership
      </h1>
      <p className="mb-8 text-[13px] text-spotlight-text-muted">{email}</p>

      <div className="rounded-xl border border-[rgba(12,27,51,0.08)] bg-white p-6 shadow-[0_4px_24px_rgba(12,27,51,0.06)]">
        {sub ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span
                className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[1px] ${
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {sub.is_comped ? "Complimentary" : sub.status}
              </span>
              {sub.plan && (
                <span className="text-[12px] capitalize text-spotlight-text-muted">
                  {sub.plan} plan
                </span>
              )}
            </div>

            {sub.current_period_end && !sub.is_comped && (
              <p className="text-[13px] text-spotlight-text-mid">
                {isActive ? "Renews" : "Ended"}{" "}
                {new Date(sub.current_period_end).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}

            {sub.stripe_customer_id && !sub.is_comped && (
              <button
                onClick={() => void openPortal()}
                disabled={portalLoading}
                className="rounded-lg border border-[rgba(12,27,51,0.12)] px-5 py-2.5 text-[12px] font-medium text-spotlight-navy transition hover:border-spotlight-navy/30 disabled:opacity-50"
              >
                {portalLoading ? "Opening..." : "Manage billing"}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-[14px] text-spotlight-text-mid">
              No active subscription found.
            </p>
            <Link
              href="/access?next=/subscribe"
              className="inline-flex items-center justify-center rounded-lg bg-spotlight-navy px-6 py-3 text-[12px] font-semibold uppercase tracking-[1px] text-spotlight-gold no-underline transition hover:bg-spotlight-teal"
            >
              Subscribe
            </Link>
          </div>
        )}
      </div>

      {/* Quick links */}
      {isActive && (
        <div className="mt-8">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[2px] text-spotlight-text-muted">
            Your premium content
          </p>
          <div className="grid gap-2 min-[400px]:grid-cols-2">
            {[
              { href: "/real-estate", label: "Real Estate" },
              { href: "/events", label: "Events" },
              { href: "/deals", label: "Deals" },
              { href: "/openings", label: "New Openings" },
              { href: "/ticketing", label: "Tickets" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg border border-[rgba(12,27,51,0.06)] bg-white px-4 py-3 text-[13px] font-medium text-spotlight-navy no-underline transition hover:border-spotlight-gold/30 hover:shadow-sm"
              >
                {l.label} →
              </Link>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => void handleLogout()}
        className="mt-8 text-[12px] font-medium text-spotlight-text-muted hover:text-red-600 hover:underline"
      >
        Sign out
      </button>
    </main>
  );
}
