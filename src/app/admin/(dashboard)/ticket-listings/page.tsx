import { AdminCrud, type FieldDef } from "@/components/admin/AdminCrud";

const fields: FieldDef[] = [
  { key: "title", label: "Title", placeholder: "Hilton Head Jazz Festival", required: true },
  { key: "subtitle", label: "Subtitle", placeholder: "Outdoor amphitheater · All ages" },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Optional longer copy for the card.",
  },
  { key: "day", label: "Day (badge)", placeholder: "18" },
  { key: "month", label: "Month (badge)", placeholder: "Apr" },
  { key: "location", label: "Location", placeholder: "Shelter Cove" },
  { key: "price", label: "Price line", placeholder: "From $45 · General admission" },
  {
    key: "ticket_url",
    label: "Ticket / checkout URL",
    placeholder: "https://…",
    required: true,
  },
  { key: "cta", label: "Button text", placeholder: "Get tickets", defaultValue: "Get tickets" },
  {
    key: "image_url",
    label: "Image",
    type: "image",
    placeholder: "Upload or paste image URL",
  },
  { key: "is_published", label: "Published (visible on /ticketing)", type: "boolean", defaultValue: true },
];

const columns = ["title", "location", "price", "is_published", "ticket_url"];

export default function AdminTicketListingsPage() {
  return (
    <AdminCrud
      table="ticket_listings"
      title="Ticket listings"
      fields={fields}
      columns={columns}
      searchKeys={["title", "location", "subtitle"]}
      searchPlaceholder="Search ticket listings…"
    />
  );
}
