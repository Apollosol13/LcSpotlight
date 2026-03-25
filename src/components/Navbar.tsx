"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/events", label: "Events" },
  { href: "/openings", label: "New Openings" },
  { href: "/news", label: "News" },
  { href: "/things-to-do", label: "Things To Do" },
  { href: "/real-estate", label: "Real Estate" },
  { href: "/ticketing", label: "Tickets" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className="sticky top-0 z-[100] flex min-h-[60px] items-center justify-between border-b border-spotlight-gold/25 bg-spotlight-navy px-5 py-2 min-[601px]:px-10"
        aria-label="Main"
      >
        <Link
          href="/"
          className="flex flex-col gap-0.5 leading-none no-underline"
        >
          <span className="font-serif text-[10px] font-semibold uppercase tracking-[0.28em] text-white min-[601px]:text-[11px]">
            Lowcountry
          </span>
          <span className="font-serif text-[1.35rem] font-normal italic text-spotlight-gold min-[601px]:text-[1.5rem]">
            Spotlight
          </span>
        </Link>

        <ul className="m-0 hidden list-none items-stretch gap-0 p-0 min-[601px]:flex">
          {navItems.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`block px-4 py-5 text-[13px] font-normal uppercase tracking-[0.5px] transition-colors ${
                    active
                      ? "text-spotlight-gold"
                      : "text-white/70 hover:text-spotlight-gold"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="cursor-pointer rounded-[2px] bg-spotlight-gold px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wide text-spotlight-navy transition-opacity hover:opacity-90 max-[600px]:hidden"
          >
            Submit a Story
          </button>

          <button
            type="button"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-white/15 min-[601px]:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="spotlight-mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`absolute left-2 block h-0.5 w-5 bg-white/80 transition-all duration-200 ${mobileOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[13px]"}`}
            />
            <span
              className={`absolute left-2 top-[19px] block h-0.5 w-5 bg-white/80 transition-all duration-200 ${mobileOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      <div
        id="spotlight-mobile-nav"
        className={`fixed inset-0 z-[99] min-[601px]:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/50 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
          tabIndex={mobileOpen ? 0 : -1}
          aria-label="Close menu"
        />
        <div
          className={`absolute right-0 top-[60px] flex w-[min(100%,320px)] flex-col border-l border-spotlight-gold/25 bg-spotlight-navy shadow-xl transition-transform duration-200 ease-out ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <ul className="m-0 list-none p-0">
            {navItems.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <li key={href} className="border-b border-white/[0.06]">
                  <Link
                    href={href}
                    className={`block px-6 py-4 text-[13px] font-normal uppercase tracking-[0.5px] ${
                      active
                        ? "text-spotlight-gold"
                        : "text-white/70 hover:text-spotlight-gold"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="p-4">
            <button
              type="button"
              className="w-full cursor-pointer rounded-[2px] bg-spotlight-gold px-3.5 py-3 text-[11px] font-medium uppercase tracking-wide text-spotlight-navy"
            >
              Submit a Story
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
