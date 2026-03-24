import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 300;

export default async function ThingsToDoPage() {
  const { data: deals } = await supabase
    .from("things_to_do")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-16 min-[601px]:px-10">
      <div className="mb-10 border-b border-[rgba(12,27,51,0.1)] pb-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-text-muted">
          Deals &amp; Discounts
        </p>
        <h1 className="font-serif text-3xl font-normal text-spotlight-navy">
          Things <em className="italic text-spotlight-gold">To Do</em>
        </h1>
        <p className="mt-3 text-sm text-spotlight-text-mid">
          Activities, offers, and experiences in the Lowcountry.
        </p>
      </div>

      <div className="grid gap-5 min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
        {(deals ?? []).map((d) => (
          <div
            key={d.id}
            className="group relative overflow-hidden rounded border border-[rgba(12,27,51,0.1)] bg-white p-6 transition-colors hover:border-spotlight-teal"
          >
            <div className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-spotlight-teal transition-transform group-hover:scale-x-100" />
            {d.icon && <span className="mb-3 block text-[28px]">{d.icon}</span>}
            <span className="mb-3.5 inline-flex items-center rounded-[2px] bg-[rgba(30,123,114,0.1)] px-3 py-1 text-[13px] font-medium text-spotlight-teal">
              {d.badge}
            </span>
            <h2 className="mb-1.5 font-serif text-[17px] font-normal text-spotlight-navy">
              {d.title}
            </h2>
            {d.description && (
              <p className="mb-3.5 text-[13px] font-light text-spotlight-text-muted">
                {d.description}
              </p>
            )}
            {d.venue && (
              <p className="text-xs font-medium uppercase tracking-[0.5px] text-spotlight-text-mid">
                {d.venue}
              </p>
            )}
            {d.expires && (
              <p className="mt-1 text-[11px] text-spotlight-coral">{d.expires}</p>
            )}
          </div>
        ))}
      </div>

      {(!deals || deals.length === 0) && (
        <p className="py-20 text-center text-sm text-spotlight-text-muted">
          No deals yet. Check back soon.
        </p>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-[1px] text-spotlight-gold no-underline hover:underline"
        >
          &larr; Back to Home
        </Link>
      </div>
    </main>
  );
}
