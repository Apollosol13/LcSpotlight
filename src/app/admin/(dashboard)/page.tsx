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
    { label: "Events", count: events, href: "/admin/events" },
    { label: "News", count: news, href: "/admin/news" },
    { label: "Openings", count: openings, href: "/admin/openings" },
    { label: "Things To Do", count: thingsToDo, href: "/admin/things-to-do" },
  ];

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold text-white">Dashboard</h1>
      <p className="mb-8 text-sm text-white/40">
        Manage your LCSpotlight content
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-5 no-underline transition hover:border-spotlight-gold/30 hover:bg-white/[0.05]"
          >
            <p className="text-3xl font-bold text-white">{card.count}</p>
            <p className="mt-1 text-sm text-white/50">{card.label}</p>
          </a>
        ))}
      </div>
    </>
  );
}
