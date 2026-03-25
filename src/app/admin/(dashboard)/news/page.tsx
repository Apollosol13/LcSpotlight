import { AdminCrud, type FieldDef } from "@/components/admin/AdminCrud";

const fields: FieldDef[] = [
  { key: "title", label: "Headline", placeholder: "New Shoreline Restoration Project...", required: true },
  { key: "category", label: "Category", placeholder: "Environment, Education, Community..." },
  { key: "date", label: "Date", placeholder: "March 22, 2026" },
  { key: "description", label: "Description", type: "textarea", placeholder: "Article summary..." },
  { key: "author", label: "Author", placeholder: "Town of HHI" },
  { key: "read_time", label: "Read Time", placeholder: "4 min read" },
  { key: "icon", label: "Icon", placeholder: "Emoji or symbol" },
  { key: "image_bg", label: "Header Color", type: "color", defaultValue: "#14324A" },
  { key: "featured", label: "Featured", type: "boolean", defaultValue: false },
  { key: "source_url", label: "Source URL", placeholder: "https://..." },
];

const columns = ["title", "category", "date", "featured", "source"];

export default function AdminNewsPage() {
  return (
    <AdminCrud
      table="news"
      title="News"
      fields={fields}
      columns={columns}
    />
  );
}
