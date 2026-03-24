import Link from "next/link";
import { supabase } from "@/lib/supabase";

export async function OpeningsSection() {
  const { data: openings } = await supabase
    .from("openings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(4);
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-16 min-[601px]:px-10">
      <div className="mb-9 flex items-baseline justify-between border-b border-[rgba(12,27,51,0.1)] pb-4">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-text-muted">
            Just Arrived
          </p>
          <h2 className="font-serif text-[32px] font-normal text-spotlight-navy">
            New <em className="italic text-spotlight-gold">Openings</em>
          </h2>
        </div>
        <Link
          href="/openings"
          className="text-xs font-medium uppercase tracking-[1px] text-spotlight-gold no-underline transition-colors hover:underline"
        >
          See All →
        </Link>
      </div>

      <div className="grid gap-5 min-[601px]:grid-cols-2 min-[901px]:grid-cols-4">
        {(openings ?? []).map((o) => (
          <div
            key={o.id}
            className="relative cursor-pointer rounded border border-[rgba(12,27,51,0.1)] bg-white p-6 transition-transform hover:-translate-y-0.5"
          >
            <span className="absolute right-4 top-4 rounded-[2px] bg-spotlight-coral px-2 py-[3px] text-[9px] font-medium uppercase tracking-[1px] text-white">
              New
            </span>
            <div className="mb-4 flex size-12 items-center justify-center rounded bg-spotlight-sand text-[22px]">
              {o.icon}
            </div>
            <h3 className="mb-1 font-serif text-base font-normal leading-tight text-spotlight-navy">
              {o.name}
            </h3>
            <p className="mb-3 text-xs uppercase tracking-[0.5px] text-spotlight-text-muted">
              {o.type}
            </p>
            <p className="text-xs font-medium text-spotlight-teal">
              📍 {o.location}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
