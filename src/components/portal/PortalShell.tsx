"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSubNav } from "@/app/admin/AdminSubNav";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const businessNav: { title: string; items: { href: string; label: string }[] } = {
  title: "Your listings",
  items: [
    { href: "/business", label: "Dashboard" },
    { href: "/business/events", label: "Events" },
    { href: "/business/things-to-do", label: "Things To Do" },
    { href: "/business/discounts", label: "Discounts" },
  ],
};

const siteAdminNav: { title: string; items: { href: string; label: string }[] } = {
  title: "Site admin",
  items: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/invite-business", label: "Invite business" },
    { href: "/admin/story-submissions", label: "Story submissions" },
    { href: "/admin/event-submissions", label: "Event submissions" },
    { href: "/admin/events", label: "Events (all)" },
    { href: "/admin/news", label: "News" },
    { href: "/admin/openings", label: "Openings" },
    { href: "/admin/things-to-do", label: "Things To Do (all)" },
  ],
};

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="size-6 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <>
          <path d="M5 7h14M5 12h14M5 17h14" />
        </>
      )}
    </svg>
  );
}

function NavLink({
  href,
  label,
  pathname,
  onNavigate,
  exact,
}: {
  href: string;
  label: string;
  pathname: string;
  onNavigate: () => void;
  exact?: boolean;
}) {
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center rounded-md px-3 py-2.5 text-sm no-underline transition active:opacity-90 ${
        isActive
          ? "bg-spotlight-gold/10 text-spotlight-gold"
          : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

type PortalShellProps = {
  children: React.ReactNode;
  /** When true, show horizontal AdminSubNav on wide screens (admin routes only). */
  showAdminSubNav?: boolean;
};

export function PortalShell({ children, showAdminSubNav = false }: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isStaff, setIsStaff] = useState<boolean | null>(null);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    let cancelled = false;
    const client = createSupabaseBrowser();
    (async () => {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setIsStaff(false);
        return;
      }
      const { data } = await client
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setIsStaff(data?.role === "admin");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    setMobileNavOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const closeMobile = () => setMobileNavOpen(false);
  const homeHref =
    isStaff === true ? "/admin" : isStaff === false ? "/business" : "/admin";
  const subtitle =
    isStaff === null ? "…" : isStaff ? "Staff portal" : "Business portal";

  return (
    <div className="min-h-screen bg-black md:flex">
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-[#0a0a0a] px-4 md:hidden">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/5 transition hover:bg-white/10"
          aria-expanded={mobileNavOpen}
          aria-controls="portal-sidebar"
          aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileNavOpen((o) => !o)}
        >
          <MenuIcon open={mobileNavOpen} />
        </button>
        <Link
          href={homeHref}
          className="font-serif text-[15px] text-white no-underline"
          onClick={closeMobile}
        >
          LC<span className="text-spotlight-gold">Spotlight</span>
        </Link>
        <span className="size-10 shrink-0" aria-hidden />
      </header>

      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-[2px] md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        id="portal-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(19rem,92vw)] flex-col border-r border-white/5 bg-[#0a0a0a] transition-transform duration-200 ease-out md:sticky md:top-0 md:z-auto md:h-screen md:w-60 md:max-w-none md:shrink-0 md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="border-b border-white/5 px-5 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] md:pt-5">
          <Link
            href={homeHref}
            className="font-serif text-lg text-white no-underline"
            onClick={closeMobile}
          >
            LC<span className="text-spotlight-gold">Spotlight</span>
          </Link>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/40">{subtitle}</p>
          <Link
            href="/"
            className="mt-2 inline-block text-[11px] text-white/35 no-underline transition hover:text-spotlight-gold"
            onClick={closeMobile}
          >
            View public site →
          </Link>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-3 py-4">
          <div>
            <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-white/35">
              {businessNav.title}
            </p>
            <div className="space-y-0.5">
              {businessNav.items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  pathname={pathname}
                  onNavigate={closeMobile}
                  exact={item.href === "/business"}
                />
              ))}
            </div>
          </div>

          {isStaff ? (
            <div>
              <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-white/35">
                {siteAdminNav.title}
              </p>
              <div className="space-y-0.5">
                {siteAdminNav.items.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    pathname={pathname}
                    onNavigate={closeMobile}
                    exact={item.href === "/admin"}
                  />
                ))}
              </div>
            </div>
          ) : isStaff === false ? null : (
            <p className="px-3 text-xs text-white/30">Loading menu…</p>
          )}
        </nav>

        <div className="border-t border-white/5 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center rounded-md px-3 py-2.5 text-sm text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 overflow-auto md:min-h-0">
        <div className="mx-auto max-w-5xl px-4 pb-8 pt-[calc(3.5rem+1.5rem)] md:px-8 md:py-8 md:pt-8">
          {showAdminSubNav && pathname.startsWith("/admin") ? (
            <div className="hidden md:block">
              <AdminSubNav />
            </div>
          ) : null}
          {children}
        </div>
      </main>
    </div>
  );
}
