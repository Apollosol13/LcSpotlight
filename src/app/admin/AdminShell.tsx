"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/events", label: "Events", icon: "🎵" },
  { href: "/admin/news", label: "News", icon: "📰" },
  { href: "/admin/openings", label: "Openings", icon: "🏪" },
  { href: "/admin/things-to-do", label: "Things To Do", icon: "🎯" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-white/5 bg-[#0c1322]">
        <div className="border-b border-white/5 px-5 py-5">
          <Link href="/" className="font-serif text-lg text-white no-underline">
            LC<span className="text-spotlight-gold">Spotlight</span>
          </Link>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/40">Admin</p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm no-underline transition ${
                  isActive
                    ? "bg-spotlight-gold/10 text-spotlight-gold"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <span className="text-base">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
