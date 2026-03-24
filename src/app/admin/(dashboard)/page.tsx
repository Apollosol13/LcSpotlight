import { createSupabaseServer } from "@/lib/supabase-auth-server";

export const dynamic = "force-dynamic";

async function getCount(table: string) {
  const supabase = await createSupabaseServer();
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminDashboard() {
  const [events, news, openings, thingsToDo] = await Promise.all([
    getCount("events"),
    getCount("news"),
    getCount("openings"),
    getCount("things_to_do"),
  ]);

  const cards = [
    { label: "Events", count: events, href: "/admin/events", icon: "🎵", color: "border-blue-500/30 bg-blue-500/5" },
    { label: "News", count: news, href: "/admin/news", icon: "📰", color: "border-emerald-500/30 bg-emerald-500/5" },
    { label: "Openings", count: openings, href: "/admin/openings", icon: "🏪", color: "border-purple-500/30 bg-purple-500/5" },
    { label: "Things To Do", count: thingsToDo, href: "/admin/things-to-do", icon: "🎯", color: "border-amber-500/30 bg-amber-500/5" },
  ];

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold text-white">Dashboard</h1>
      <p className="mb-8 text-sm text-white/50">
        Manage your LCSpotlight content
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className={`rounded-lg border p-5 transition hover:scale-[1.02] ${card.color} no-underline`}
          >
            <span className="text-2xl">{card.icon}</span>
            <p className="mt-3 text-3xl font-bold text-white">{card.count}</p>
            <p className="mt-1 text-sm text-white/50">{card.label}</p>
          </a>
        ))}
      </div>
    </>
  );
}
