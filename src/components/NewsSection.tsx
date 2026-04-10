import Link from "next/link";
import { parseNewsImageBg } from "@/components/NewsArticleHeroImage";
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

const CATEGORY_GRADIENTS: Record<string, string> = {
  "Hilton Head": "from-[#0c1b33] to-[#1a4a5e]",
  "Bluffton": "from-[#1a3a2a] to-[#2d6a4f]",
  "Beaufort": "from-[#2c1810] to-[#6b3a2a]",
  "Savannah": "from-[#1c2541] to-[#3a506b]",
};

const FALLBACK_GRADIENT = "from-[#0c1b33] to-[#1a4a5e]";

function gradientFor(category: string | null): string {
  if (!category) return FALLBACK_GRADIENT;
  return CATEGORY_GRADIENTS[category] ?? FALLBACK_GRADIENT;
}

export async function NewsSection() {
  const { data: allNews } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  const articles = allNews ?? [];

  return (
    <section className="bg-spotlight-cream px-5 py-16 min-[601px]:px-12 min-[601px]:py-[72px]">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 min-[601px]:flex-row min-[601px]:items-end min-[601px]:justify-between">
          <div>
            <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.22em] text-spotlight-teal/55">
              Community
            </p>
            <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-spotlight-navy">
              News &amp;{" "}
              <em className="font-normal italic text-spotlight-teal">Updates</em>
            </h2>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 self-start border-b border-spotlight-gold-dark pb-1 text-[10px] font-normal uppercase tracking-[0.16em] text-spotlight-gold-dark no-underline min-[601px]:self-auto"
          >
            All stories →
          </Link>
        </div>

        {/* Card grid */}
        {articles.length === 0 ? (
          <p className="text-sm text-spotlight-text-muted">
            No stories available right now.
          </p>
        ) : (
          <div className="grid gap-4 min-[640px]:grid-cols-2 min-[960px]:grid-cols-3">
            {articles.map((a) => {
              const { kind, value } = parseNewsImageBg(a.image_bg);
              const hasImage = kind === "url";
              const imgSrc =
                hasImage && value.startsWith("//") ? `https:${value}` : value;
              const gradient = gradientFor(a.category);

              return (
                <a
                  key={a.id}
                  href={a.source_url ?? "/news"}
                  target={a.source_url ? "_blank" : undefined}
                  rel={a.source_url ? "noopener noreferrer" : undefined}
                  className="group overflow-hidden rounded-lg border border-[rgba(12,27,51,0.06)] bg-white no-underline transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(12,27,51,0.1)]"
                >
                  {/* Image / gradient fallback */}
                  <div className="relative h-[180px] w-full overflow-hidden">
                    {hasImage ? (
                      <>
                        <img
                          src={imgSrc}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </>
                    ) : (
                      <div
                        className={`flex h-full w-full items-end bg-gradient-to-br ${gradient} p-5`}
                      >
                        <span className="font-serif text-[20px] font-bold leading-tight text-white/90">
                          {a.category ?? "News"}
                        </span>
                      </div>
                    )}

                    {/* Category badge (only when there's an image) */}
                    {hasImage && a.category && (
                      <span className="absolute left-3 top-3 rounded-[3px] bg-spotlight-navy/80 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.8px] text-white/90 backdrop-blur-sm">
                        {a.category}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="mb-2 line-clamp-2 font-serif text-[16px] font-semibold leading-snug text-spotlight-navy group-hover:text-spotlight-teal">
                      {decode(a.title)}
                    </h3>
                    {a.description && (
                      <p className="mb-3 line-clamp-2 text-[12px] font-light leading-relaxed text-spotlight-text-mid">
                        {decode(a.description)}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-spotlight-text-muted">
                      {a.author && <span>By {a.author}</span>}
                      {a.author && a.date && (
                        <span className="text-spotlight-sand">·</span>
                      )}
                      {a.date && <span>{a.date}</span>}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
