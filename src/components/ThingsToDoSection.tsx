import Link from "next/link";
import { supabase } from "@/lib/supabase";

export async function ThingsToDoSection() {
  const { data: deals } = await supabase
    .from("things_to_do")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(6);
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-16 min-[601px]:px-10">
      <div className="mb-9 flex items-baseline justify-between border-b border-[rgba(17,34,80,0.1)] pb-4">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-text-muted">
            Deals &amp; Discounts
          </p>
          <h2 className="font-serif text-[32px] font-normal text-spotlight-navy">
            Things <em className="italic text-spotlight-gold">To Do</em>
          </h2>
        </div>
        <Link
          href="/things-to-do"
          className="text-xs font-medium uppercase tracking-[1px] text-spotlight-gold no-underline transition-colors hover:underline"
        >
          All deals
        </Link>
      </div>

      <div className="grid gap-5 min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
        {(deals ?? []).map((d) => (
          <div
            key={d.id}
            className="group relative cursor-pointer overflow-hidden rounded border border-[rgba(17,34,80,0.1)] bg-white p-6 transition-colors hover:border-spotlight-teal/50"
          >
            <div className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-spotlight-teal transition-transform group-hover:scale-x-100" />

            <span className="mb-3.5 inline-flex items-center rounded-[2px] border border-spotlight-teal/20 bg-spotlight-teal/10 px-3 py-1 text-[13px] font-medium text-spotlight-gold">
              {d.badge}
            </span>
            <h3 className="mb-1.5 font-serif text-[17px] font-normal text-spotlight-navy">
              {d.title}
            </h3>
            <p className="mb-3.5 text-[13px] font-light text-spotlight-text-muted">
              {d.description}
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.5px] text-spotlight-text-mid">
              {d.venue}
            </p>
            <p className="mt-1 text-[11px] text-spotlight-coral">{d.expires}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
