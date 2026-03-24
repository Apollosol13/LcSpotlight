import Link from "next/link";
import { supabase } from "@/lib/supabase";

function decode(str: string) {
  return str
    .replace(/&#8212;/g, "\u2014")
    .replace(/&#8211;/g, "\u2013")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

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
          <a
            href={featured.source_url ?? "/news"}
            target={featured.source_url ? "_blank" : undefined}
            rel={featured.source_url ? "noopener noreferrer" : undefined}
            className="overflow-hidden rounded border border-[rgba(12,27,51,0.1)] bg-white no-underline transition-shadow hover:shadow-[0_8px_32px_rgba(12,27,51,0.08)]"
          >
            <div className="relative h-[280px] overflow-hidden bg-[#14324A]">
              {featured.image_bg?.startsWith("http") ? (
                <img
                  src={featured.image_bg}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,27,51,0.6)] to-transparent" />
            </div>
            <div className="p-7">
              <span className="mb-2.5 inline-block border-b border-[rgba(201,168,76,0.3)] pb-1 text-[10px] font-medium uppercase tracking-[2px] text-spotlight-gold">
                {featured.category}
              </span>
              <h3 className="mb-3 font-serif text-[26px] font-normal leading-[1.3] text-spotlight-navy">
                {decode(featured.title)}
              </h3>
              {featured.description && (
                <p className="mb-4 text-sm font-light leading-[1.7] text-spotlight-text-mid">
                  {decode(featured.description)}
                </p>
              )}
              <div className="flex gap-4 text-xs text-spotlight-text-muted">
                {featured.author && <span>By {featured.author}</span>}
                {featured.date && <span>{featured.date}</span>}
                {featured.read_time && <span>{featured.read_time}</span>}
              </div>
            </div>
          </a>
        )}

        <div className="flex flex-col gap-4">
          {sidebarItems.map((item) => (
            <a
              key={item.id}
              href={item.source_url ?? "/news"}
              target={item.source_url ? "_blank" : undefined}
              rel={item.source_url ? "noopener noreferrer" : undefined}
              className="flex items-start gap-4 rounded border border-[rgba(12,27,51,0.1)] bg-white p-5 no-underline transition-colors hover:border-spotlight-gold"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded bg-spotlight-sand text-xs font-semibold uppercase text-spotlight-text-muted">
                {item.category?.[0] ?? "N"}
              </div>
              <div>
                <h4 className="mb-1.5 font-serif text-[15px] font-normal leading-[1.4] text-spotlight-navy">
                  {decode(item.title)}
                </h4>
                <p className="text-[11px] text-spotlight-text-muted">
                  {item.category}{item.date ? ` · ${item.date}` : ""}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
