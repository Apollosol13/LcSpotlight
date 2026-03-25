import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 300;

export default async function OpeningsPage() {
  const { data: openings } = await supabase
    .from("openings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-16 min-[601px]:px-10">
      <div className="mb-10 border-b border-[rgba(12,27,51,0.1)] pb-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-text-muted">
          What&apos;s New
        </p>
        <h1 className="font-serif text-3xl font-normal text-spotlight-navy">
          New <em className="italic text-spotlight-gold">Openings</em>
        </h1>
        <p className="mt-3 text-sm text-spotlight-text-mid">
          Restaurants, shops, and venues opening near you.
        </p>
      </div>

      <div className="grid gap-5 min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
        {(openings ?? []).map((o) => (
          <div
            key={o.id}
            className="relative rounded border border-[rgba(12,27,51,0.1)] bg-white p-6 transition-transform hover:-translate-y-0.5"
          >
            <span className="absolute right-4 top-4 rounded-[2px] bg-spotlight-coral px-2 py-[3px] text-[9px] font-medium uppercase tracking-[1px] text-white">
              New
            </span>
            <div className="mb-4 flex size-12 items-center justify-center rounded bg-spotlight-sand text-xs font-semibold uppercase tracking-wide text-spotlight-text-muted">
              {(o.type?.replace(/[^A-Za-z]/g, "").charAt(0) || o.name?.charAt(0) || "?").toUpperCase()}
            </div>
            <h2 className="mb-1 font-serif text-base font-normal leading-tight text-spotlight-navy">
              {o.name}
            </h2>
            <p className="mb-3 text-xs uppercase tracking-[0.5px] text-spotlight-text-muted">
              {o.type}
            </p>
            <p className="text-xs font-medium text-spotlight-gold">{o.location}</p>
          </div>
        ))}
      </div>

      {(!openings || openings.length === 0) && (
        <p className="py-20 text-center text-sm text-spotlight-text-muted">
          No new openings yet. Check back soon.
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
