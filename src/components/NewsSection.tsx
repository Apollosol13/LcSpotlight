import Link from "next/link";
import { supabase } from "@/lib/supabase";

export async function NewsSection() {
  const { data: allNews } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const featured = (allNews ?? []).find((n) => n.featured) ?? (allNews ?? [])[0];
  const sidebarItems = (allNews ?? []).filter((n) => n.id !== featured?.id).slice(0, 4);
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-16 min-[601px]:px-10">
      <div className="mb-9 flex items-baseline justify-between border-b border-[rgba(12,27,51,0.1)] pb-4">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-text-muted">
            Community
          </p>
          <h2 className="font-serif text-[32px] font-normal text-spotlight-navy">
            News &amp; <em className="italic text-spotlight-gold">Updates</em>
          </h2>
        </div>
        <Link
          href="/news"
          className="text-xs font-medium uppercase tracking-[1px] text-spotlight-gold no-underline transition-colors hover:underline"
        >
          All Stories →
        </Link>
      </div>

      <div className="grid gap-8 min-[901px]:grid-cols-[2fr_1fr]">
        {featured && (
          <div className="cursor-pointer overflow-hidden rounded border border-[rgba(12,27,51,0.1)] bg-white transition-shadow hover:shadow-[0_8px_32px_rgba(12,27,51,0.08)]">
            <div
              className="relative flex h-[280px] items-center justify-center overflow-hidden"
              style={{ background: featured.image_bg ?? "#14324A" }}
            >
              <span className="text-[60px] opacity-15">{featured.icon ?? "📰"}</span>
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,27,51,0.8)] to-transparent" />
            </div>
            <div className="p-7">
              <span className="mb-2.5 inline-block border-b border-[rgba(201,168,76,0.3)] pb-1 text-[10px] font-medium uppercase tracking-[2px] text-spotlight-gold">
                {featured.category}
              </span>
              <h3 className="mb-3 font-serif text-[26px] font-normal leading-[1.3] text-spotlight-navy">
                {featured.title}
              </h3>
              {featured.description && (
                <p className="mb-4 text-sm font-light leading-[1.7] text-spotlight-text-mid">
                  {featured.description}
                </p>
              )}
              <div className="flex gap-4 text-xs text-spotlight-text-muted">
                {featured.author && <span>By {featured.author}</span>}
                {featured.date && <span>{featured.date}</span>}
                {featured.read_time && <span>{featured.read_time}</span>}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {sidebarItems.map((item) => (
            <div
              key={item.id}
              className="flex cursor-pointer items-start gap-4 rounded border border-[rgba(12,27,51,0.1)] bg-white p-5 transition-colors hover:border-spotlight-gold"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded bg-spotlight-sand text-lg">
                {item.icon ?? "📰"}
              </div>
              <div>
                <h4 className="mb-1.5 font-serif text-[15px] font-normal leading-[1.4] text-spotlight-navy">
                  {item.title}
                </h4>
                <p className="text-[11px] text-spotlight-text-muted">
                  {item.category}{item.date ? ` · ${item.date}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
