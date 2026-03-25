import Link from "next/link";
import { supabase } from "@/lib/supabase";

function openingIcon(type: string | null | undefined, name: string | null | undefined) {
  const t = (type || "").toLowerCase();
  if (t.includes("restaurant") || t.includes("food") || t.includes("dessert")) return "🍽️";
  if (t.includes("ice") || t.includes("cafe") || t.includes("coffee")) return "🍦";
  if (t.includes("beauty") || t.includes("salon") || t.includes("wellness")) return "💇";
  if (t.includes("gym") || t.includes("fitness")) return "🏋️";
  return (name?.[0] || "?").toUpperCase();
}

export async function OpeningsSection() {
  const { data: openings } = await supabase
    .from("openings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <section className="bg-spotlight-navy px-5 py-16 min-[601px]:px-12 min-[601px]:py-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-col gap-4 min-[601px]:flex-row min-[601px]:items-end min-[601px]:justify-between">
          <div>
            <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-gold/60">
              Just arrived
            </p>
            <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-spotlight-cream">
              New <em className="font-normal italic text-spotlight-gold">Openings</em>
            </h2>
          </div>
          <Link
            href="/openings"
            className="inline-flex items-center gap-2 self-start border-b border-spotlight-gold/30 pb-1 text-[10px] font-normal uppercase tracking-[0.16em] text-spotlight-gold/55 no-underline min-[601px]:self-auto"
          >
            See all →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-px bg-spotlight-gold/[0.06] min-[601px]:grid-cols-2 min-[901px]:grid-cols-4">
          {(openings ?? []).map((o) => (
            <Link
              key={o.id}
              href="/openings"
              className="relative border border-spotlight-gold/[0.07] bg-spotlight-navy/50 px-6 py-7 transition-colors hover:bg-spotlight-teal/50 no-underline min-[601px]:px-6 min-[601px]:py-7"
            >
              <span className="absolute right-5 top-5 bg-spotlight-gold px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.16em] text-spotlight-navy">
                New
              </span>
              <span className="mb-4 block text-2xl leading-none" aria-hidden>
                {openingIcon(o.type, o.name)}
              </span>
              <p className="mb-2 text-[9px] font-normal uppercase tracking-[0.18em] text-spotlight-gold/55">
                {o.type}
              </p>
              <h3 className="mb-1.5 font-serif text-xl font-bold leading-tight text-spotlight-cream">
                {o.name}
              </h3>
              <p className="text-[11px] font-light tracking-[0.04em] text-spotlight-cream/35">
                {o.location}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
