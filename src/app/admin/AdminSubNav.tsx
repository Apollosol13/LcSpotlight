"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs: { href: string; label: string; exact?: boolean }[] = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/story-submissions", label: "Story submissions" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/openings", label: "Openings" },
  { href: "/admin/things-to-do", label: "Things to do" },
];

export function AdminSubNav() {
  const pathname = usePathname();

  return (
    <div className="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-md px-3 py-1.5 text-xs font-medium no-underline transition ${
              active
                ? "bg-spotlight-gold/15 text-spotlight-gold"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
