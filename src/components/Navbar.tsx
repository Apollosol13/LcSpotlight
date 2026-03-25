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
        className="sticky top-0 z-[100] flex h-14 items-center justify-between gap-4 border-b border-spotlight-sand bg-spotlight-cream px-5 min-[601px]:px-12"
        aria-label="Main"
      >
        <Link href="/" className="relative z-[2] shrink-0 no-underline">
          <span className="font-serif text-xl tracking-[0.04em] text-spotlight-navy">
            <span className="font-bold">LC</span>
            <em className="font-normal italic text-spotlight-teal">Spotlight</em>
          </span>
        </Link>

        <ul className="m-0 hidden min-h-0 min-w-0 flex-1 list-none flex-wrap items-center justify-end gap-x-6 gap-y-2 p-0 min-[601px]:flex">
          {navItems.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  className={`text-[11px] font-normal uppercase tracking-[0.12em] no-underline transition-opacity ${
                    active
                      ? "text-spotlight-teal opacity-100"
                      : "text-spotlight-teal opacity-70 hover:opacity-100"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
          <li className="shrink-0">
            <Link
              href="/submit-story"
              prefetch={true}
              className="inline-flex items-center justify-center rounded-sm bg-spotlight-gold px-[14px] py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-spotlight-navy no-underline transition-colors hover:bg-spotlight-gold-dark"
            >
              Submit a Story
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className="relative z-[2] flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-spotlight-navy/15 min-[601px]:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-controls="spotlight-mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <span
            className={`absolute left-2 block h-0.5 w-5 bg-spotlight-navy/80 transition-all duration-200 ${mobileOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[13px]"}`}
          />
          <span
            className={`absolute left-2 top-[19px] block h-0.5 w-5 bg-spotlight-navy/80 transition-all duration-200 ${mobileOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      <div
        id="spotlight-mobile-nav"
        className={`fixed inset-0 z-[99] min-[601px]:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
          tabIndex={mobileOpen ? 0 : -1}
          aria-label="Close menu"
        />
        <div
          className={`absolute right-0 top-14 flex w-[min(100%,320px)] flex-col border-l border-spotlight-sand bg-spotlight-cream shadow-xl transition-transform duration-200 ease-out ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <ul className="m-0 list-none p-0">
            {navItems.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <li key={href} className="border-b border-spotlight-navy/[0.06]">
                  <Link
                    href={href}
                    className={`block px-6 py-4 text-[11px] font-normal uppercase tracking-[0.12em] no-underline ${
                      active
                        ? "text-spotlight-teal"
                        : "text-spotlight-teal/70 hover:text-spotlight-teal"
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
            <Link
              href="/submit-story"
              className="block w-full bg-spotlight-gold px-3.5 py-3 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-spotlight-navy no-underline hover:bg-spotlight-gold-dark"
              onClick={() => setMobileOpen(false)}
            >
              Submit a Story
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
