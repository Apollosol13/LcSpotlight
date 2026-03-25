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
    <section className="bg-spotlight-cream px-5 py-16 min-[601px]:px-12 min-[601px]:py-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-col gap-4 min-[601px]:flex-row min-[601px]:items-end min-[601px]:justify-between">
        <div>
          <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-teal/55">
            Community
          </p>
          <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-spotlight-navy">
            News &amp; <em className="font-normal italic text-spotlight-teal">Updates</em>
          </h2>
        </div>
        <Link
          href="/news"
          className="inline-flex items-center gap-2 self-start border-b border-spotlight-gold-dark pb-1 text-[10px] font-normal uppercase tracking-[0.16em] text-spotlight-gold-dark no-underline min-[601px]:self-auto"
        >
          All stories →
        </Link>
        </div>

        <div className="grid gap-8 min-[901px]:grid-cols-[2fr_1fr]">
        {featured && (
          <a
            href={featured.source_url ?? "/news"}
            target={featured.source_url ? "_blank" : undefined}
            rel={featured.source_url ? "noopener noreferrer" : undefined}
            className="overflow-hidden rounded border border-[rgba(17,34,80,0.1)] bg-white no-underline transition-shadow hover:shadow-[0_8px_32px_rgba(17,34,80,0.08)]"
          >
            <div className="relative h-[280px] overflow-hidden bg-[#14324A]">
              {featured.image_bg?.startsWith("http") ? (
                <img
                  src={featured.image_bg}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(17,34,80,0.6)] to-transparent" />
            </div>
            <div className="p-7">
              <span className="mb-2.5 inline-block border-b border-[var(--border-gold)] pb-1 text-[10px] font-medium uppercase tracking-[2px] text-spotlight-gold">
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
              className="flex items-start gap-4 rounded border border-[rgba(17,34,80,0.1)] bg-white p-5 no-underline transition-colors hover:border-spotlight-gold"
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
      </div>
    </section>
  );
}
