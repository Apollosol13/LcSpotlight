import { AdminCrud, type FieldDef } from "@/components/admin/AdminCrud";

const fields: FieldDef[] = [
  { key: "name", label: "Event Name", placeholder: "Hilton Head Jazz Festival", required: true },
  { key: "category", label: "Category", placeholder: "Music, Outdoors, Food & Drink..." },
  { key: "day", label: "Day", placeholder: "05" },
  { key: "month", label: "Month", placeholder: "Apr" },
  { key: "time", label: "Time", placeholder: "6:00 PM" },
  { key: "location", label: "Location", placeholder: "Shelter Cove Marina" },
  { key: "price", label: "Price", placeholder: "From $45 · General Admission" },
  { key: "cta", label: "Button Text", placeholder: "Get Tickets", defaultValue: "Learn More" },
  { key: "icon", label: "Icon", placeholder: "Optional (unused in UI)" },
  { key: "bg", label: "Background Color", type: "color", defaultValue: "#1E3A5F" },
  {
    key: "source_url",
    label: "Listing / ticket URL",
    placeholder: "https://…",
  },
  {
    key: "image_url",
    label: "Image URL",
    placeholder: "https://… (hero image)",
  },
  {
    key: "start_at",
    label: "Start (ISO 8601)",
    placeholder: "2026-04-05T18:00:00.000Z",
  },
  {
    key: "dedupe_key",
    label: "Dedupe key",
    placeholder: "Leave blank for ingest; unique per logical event",
  },
  { key: "source", label: "Source", placeholder: "manual, rss:bluffton, …" },
];

const columns = ["name", "category", "day", "month", "location", "source"];

export default function AdminEventsPage() {
  return (
    <AdminCrud
      table="events"
      title="Events"
      fields={fields}
      columns={columns}
    />
  );
}
