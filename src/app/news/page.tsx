import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 300;

function decodeEntities(str: string) {
  return str
    .replace(/&#8212;/g, "\u2014")
    .replace(/&#8211;/g, "\u2013")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export default async function NewsPage() {
  const { data: articles } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-16 min-[601px]:px-10">
      <div className="mb-10 border-b border-[rgba(12,27,51,0.1)] pb-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[3px] text-spotlight-text-muted">
          Local Headlines
        </p>
        <h1 className="font-serif text-3xl font-normal text-spotlight-navy">
          News &amp; <em className="italic text-spotlight-gold">Updates</em>
        </h1>
        <p className="mt-3 text-sm text-spotlight-text-mid">
          Stories from Hilton Head, Bluffton, Beaufort, and Savannah.
        </p>
      </div>

      <div className="grid gap-6 min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
        {(articles ?? []).map((article) => (
          <a
            key={article.id}
            href={article.source_url ?? "#"}
            target={article.source_url ? "_blank" : undefined}
            rel={article.source_url ? "noopener noreferrer" : undefined}
            className="group overflow-hidden rounded border border-[rgba(12,27,51,0.1)] bg-white no-underline transition-shadow hover:shadow-[0_8px_32px_rgba(12,27,51,0.08)]"
          >
            <div
              className="relative flex h-[160px] items-center justify-center overflow-hidden"
              style={{ background: article.image_bg ?? "#14324A" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,27,51,0.7)] to-transparent" />
              {article.category && (
                <span className="absolute right-3 top-3 z-[1] rounded-[2px] bg-[rgba(12,27,51,0.8)] px-2.5 py-1 text-[10px] uppercase tracking-[1px] text-white/90">
                  {article.category}
                </span>
              )}
            </div>
            <div className="p-5">
              <h2 className="mb-2 font-serif text-lg font-normal leading-tight text-spotlight-navy group-hover:text-spotlight-gold">
                {decodeEntities(article.title)}
              </h2>
              {article.description && (
                <p className="mb-3 text-[13px] font-light leading-relaxed text-spotlight-text-mid line-clamp-3">
                  {decodeEntities(article.description)}
                </p>
              )}
              <div className="flex flex-wrap gap-3 text-[11px] text-spotlight-text-muted">
                {article.author && <span>By {article.author}</span>}
                {article.date && <span>{article.date}</span>}
                {article.source_url && (
                  <span className="text-spotlight-gold">Read full article &rarr;</span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>

      {(!articles || articles.length === 0) && (
        <p className="py-20 text-center text-sm text-spotlight-text-muted">
          No articles yet. Check back soon.
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
