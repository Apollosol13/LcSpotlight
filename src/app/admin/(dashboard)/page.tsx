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
  const [events, news, openings, thingsToDo, storySubmissions, ticketListings] =
    await Promise.all([
      getCount("events"),
      getCount("news"),
      getCount("openings"),
      getCount("things_to_do"),
      getCount("story_submissions"),
      getCount("ticket_listings"),
    ]);

  const cards = [
    { label: "Story submissions", count: storySubmissions, href: "/admin/story-submissions" },
    { label: "Events", count: events, href: "/admin/events" },
    { label: "Ticket listings", count: ticketListings, href: "/admin/ticket-listings" },
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

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-6 no-underline transition active:scale-[0.99] hover:border-spotlight-gold/30 hover:bg-white/[0.05] min-[480px]:p-5"
          >
            <p className="text-3xl font-bold tabular-nums text-white">{card.count}</p>
            <p className="mt-2 text-sm leading-snug text-white/50 min-[480px]:mt-1">{card.label}</p>
          </a>
        ))}
      </div>
    </>
  );
}
