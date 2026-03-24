import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: articles, error } = await supabase
  .from("news")
  .select("id, date, created_at")
  .not("date", "is", null);

if (error) { console.log("Error fetching:", error.message); process.exit(1); }

let updated = 0;
for (const article of articles) {
  try {
    const parsed = new Date(article.date);
    if (isNaN(parsed.getTime())) continue;

    const { error: updateErr } = await supabase
      .from("news")
      .update({ created_at: parsed.toISOString() })
      .eq("id", article.id);

    if (!updateErr) updated++;
  } catch {
    continue;
  }
}

console.log(`Updated ${updated} of ${articles.length} articles with proper dates`);
