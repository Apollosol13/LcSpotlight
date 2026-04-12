import type { ReactNode } from "react";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-auth-server";
import { isInviteGateEnabled } from "@/lib/membership-access";
import { hasPremiumAccess } from "@/lib/subscription";

type Props = {
  children: ReactNode;
  /** Short label describing what's behind the wall, e.g. "real estate listings" */
  feature?: string;
};

export async function Paywall({ children, feature }: Props) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allowed = await hasPremiumAccess(supabase, user?.id ?? null);
  if (allowed) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred preview of content behind */}
      <div
        className="pointer-events-none select-none overflow-hidden"
        style={{ maxHeight: "60vh", filter: "blur(6px)", opacity: 0.5 }}
        aria-hidden
      >
        {children}
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-spotlight-cream/80 to-spotlight-cream">
        <div className="mx-auto max-w-md rounded-2xl border border-[rgba(12,27,51,0.08)] bg-white px-8 py-10 text-center shadow-[0_12px_48px_rgba(12,27,51,0.12)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-spotlight-gold/20">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-spotlight-gold"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M7 11V7a5 5 0 0110 0v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h3 className="mb-2 font-serif text-xl font-bold text-spotlight-navy">
            Members only
          </h3>
          <p className="mb-6 text-[13px] leading-relaxed text-spotlight-text-mid">
            {feature
              ? `Subscribe to unlock ${feature} and all premium Lowcountry content.`
              : "Subscribe to unlock all premium Lowcountry content."}
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href={
                isInviteGateEnabled() ? "/access?next=/subscribe" : "/subscribe"
              }
              className="inline-flex w-full items-center justify-center rounded-lg bg-spotlight-navy py-3 text-[12px] font-semibold uppercase tracking-[1px] text-spotlight-gold no-underline transition hover:bg-spotlight-teal"
            >
              Subscribe — $10/mo
            </Link>
            {!user && (
              <Link
                href="/member/login"
                className="inline-flex w-full items-center justify-center rounded-lg border border-[rgba(12,27,51,0.12)] py-3 text-[12px] font-medium text-spotlight-navy no-underline transition hover:border-spotlight-navy/30"
              >
                Already a member? Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
