import { AdminCrud, type FieldDef } from "@/components/admin/AdminCrud";
import { REAL_ESTATE_MARKETS } from "@/lib/real-estate-markets";

const marketOptions = REAL_ESTATE_MARKETS.map((m) => ({ value: m.key, label: m.label }));

const fields: FieldDef[] = [
  {
    key: "market_key",
    label: "Area",
    type: "select",
    options: marketOptions,
    defaultValue: "hhi",
    required: true,
  },
  {
    key: "category",
    label: "Category",
    placeholder: "Beaches & Parks, Food trucks, Food & Drink…",
    required: true,
  },
  { key: "title", label: "Title", placeholder: "Coligny Beach Park", required: true },
  { key: "description", label: "Description", type: "textarea", placeholder: "Short description…" },
  { key: "venue", label: "Venue / location", placeholder: "Coligny Beach, HHI" },
  { key: "website", label: "Website URL", placeholder: "https://…" },
  {
    key: "image_url",
    label: "Listing image",
    type: "image",
    placeholder: "Upload or paste URL",
  },
];

const columns = ["market_key", "category", "title", "venue", "source"];

export default function AdminThingsToDoPage() {
  return (
    <AdminCrud
      table="things_to_do"
      title="Your Things To Do"
      fields={fields}
      columns={columns}
      searchKeys={["market_key", "category", "title", "venue", "description", "website", "source"]}
      searchPlaceholder="Search by title, venue, area, category…"
    />
  );
}
