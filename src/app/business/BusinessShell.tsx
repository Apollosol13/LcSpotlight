"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const navSections: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: "Overview",
    items: [{ href: "/business", label: "Dashboard" }],
  },
  {
    title: "Your listings",
    items: [
      { href: "/business/events", label: "Events" },
      { href: "/business/things-to-do", label: "Things To Do" },
      { href: "/business/discounts", label: "Discounts" },
    ],
  },
];

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

export function BusinessShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  async function handleLogout() {
    setMobileNavOpen(false);
    await supabase.auth.signOut();
    router.push("/business/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-black md:flex">
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-[#0a0a0a] px-4 md:hidden">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/5 transition hover:bg-white/10"
          aria-expanded={mobileNavOpen}
          aria-controls="business-sidebar"
          aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileNavOpen((o) => !o)}
        >
          <MenuIcon open={mobileNavOpen} />
        </button>
        <Link
          href="/business"
          className="font-serif text-[15px] text-white no-underline"
          onClick={() => setMobileNavOpen(false)}
        >
          LC<span className="text-spotlight-gold">Spotlight</span>
          <span className="ml-1.5 text-[9px] font-sans uppercase tracking-widest text-white/40">
            Business
          </span>
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
        id="business-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(18rem,88vw)] flex-col border-r border-white/5 bg-[#0a0a0a] transition-transform duration-200 ease-out md:sticky md:top-0 md:z-auto md:h-screen md:w-56 md:max-w-none md:shrink-0 md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="border-b border-white/5 px-5 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] md:pt-5">
          <Link
            href="/business"
            className="font-serif text-lg text-white no-underline"
            onClick={() => setMobileNavOpen(false)}
          >
            LC<span className="text-spotlight-gold">Spotlight</span>
          </Link>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/40">Business</p>
          <Link
            href="/"
            className="mt-2 inline-block text-[11px] text-white/35 no-underline transition hover:text-spotlight-gold"
            onClick={() => setMobileNavOpen(false)}
          >
            View public site →
          </Link>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-3 py-4">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-white/35">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/business"
                      ? pathname === "/business"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center rounded-md px-3 py-2.5 text-sm no-underline transition active:opacity-90 ${
                        isActive
                          ? "bg-spotlight-gold/10 text-spotlight-gold"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
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
          {children}
        </div>
      </main>
    </div>
  );
}
