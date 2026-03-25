import Link from "next/link";
import { supabase } from "@/lib/supabase";

export async function ThingsToDoSection() {
  const { data: deals } = await supabase
    .from("things_to_do")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(6);
  return (
    <section className="bg-spotlight-cream px-5 py-16 min-[601px]:px-12 min-[601px]:py-[72px]">
      <div className="mx-auto max-w-[1200px]">
      <div className="mb-10 flex flex-col gap-4 min-[601px]:flex-row min-[601px]:items-end min-[601px]:justify-between">
        <div>
          <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-teal/55">
            Deals &amp; discounts
          </p>
          <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-spotlight-navy">
            Things <em className="font-normal italic text-spotlight-teal">To Do</em>
          </h2>
        </div>
        <Link
          href="/things-to-do"
          className="inline-flex items-center gap-2 self-start border-b border-spotlight-gold-dark pb-1 text-[10px] font-normal uppercase tracking-[0.16em] text-spotlight-gold-dark no-underline min-[601px]:self-auto"
        >
          All deals →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-0.5 min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
        {(deals ?? []).map((d) => (
          <div
            key={d.id}
            className="group relative cursor-pointer border border-spotlight-navy/[0.06] bg-white p-6 transition-colors hover:border-spotlight-teal/40 min-[601px]:p-6"
          >
            <span className="mb-3 inline-flex items-center border border-spotlight-teal/20 bg-spotlight-teal/10 px-2.5 py-1 text-[11px] font-medium text-spotlight-teal">
              {d.badge}
            </span>
            <h3 className="mb-1.5 font-serif text-lg font-bold text-spotlight-navy">
              {d.title}
            </h3>
            <p className="mb-3 text-[13px] font-light tracking-[0.03em] text-[#8a96a8]">
              {d.description}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-spotlight-teal">
              {d.venue}
            </p>
            <p className="mt-1 text-[11px] text-spotlight-coral">{d.expires}</p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
