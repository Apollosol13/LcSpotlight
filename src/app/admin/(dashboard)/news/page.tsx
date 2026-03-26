import { AdminCrud, type FieldDef } from "@/components/admin/AdminCrud";

const fields: FieldDef[] = [
  { key: "title", label: "Headline", placeholder: "New Shoreline Restoration Project...", required: true },
  { key: "category", label: "Category", placeholder: "Environment, Education, Community..." },
  { key: "date", label: "Date", placeholder: "March 22, 2026" },
  {
    key: "description",
    label: "Summary",
    type: "textarea",
    placeholder: "Short summary in your own words (optional; scraped items start with a feed snippet).",
  },
  { key: "author", label: "Author / outlet", placeholder: "Town of HHI" },
  { key: "read_time", label: "Read Time", placeholder: "4 min read" },
  { key: "icon", label: "Icon", placeholder: "Optional (unused in UI)" },
  { key: "image_bg", label: "Header color or image URL", type: "color", defaultValue: "#14324A" },
  { key: "featured", label: "Featured", type: "boolean", defaultValue: false },
  {
    key: "source_url",
    label: "Source URL",
    placeholder: "https://… (full article; cards link here)",
  },
];

const columns = ["title", "category", "date", "featured", "source"];

export default function AdminNewsPage() {
  return (
    <div>
      <div className="mb-6 max-w-2xl space-y-2 text-sm leading-relaxed text-neutral-600">
        <p className="font-medium text-neutral-800">How news works in LcSpotlight</p>
        <ul className="list-inside list-disc space-y-1.5">
          <li>
            <strong>Scrape</strong> (<code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">POST /api/scrape</code>{" "}
            with service role): pulls Google News RSS per region, stores headline, a short RSS snippet in{" "}
            <strong>Summary</strong>, outlet name, link to Google News, and a header image when we can read it from the
            publisher site.
          </li>
          <li>
            <strong>Public site</strong> (<code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">/news</code>):
            each card shows title, summary, and opens <strong>Source URL</strong> in a new tab—no full article hosted
            here.
          </li>
          <li>
            <strong>Your editorial</strong>: edit any row to replace the snippet with your own summary; set Source URL to
            the publisher’s article if you want the “Read full article” link to go straight there.
          </li>
        </ul>
      </div>
      <AdminCrud
        table="news"
        title="News"
        fields={fields}
        columns={columns}
        searchKeys={["title", "category", "date", "author", "description", "source_url", "source"]}
        searchPlaceholder="Search headlines, category, outlet, summary, URL…"
      />
    </div>
  );
}
