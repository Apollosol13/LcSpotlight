import { AdminCrud, type FieldDef } from "@/components/admin/AdminCrud";

const fields: FieldDef[] = [
  { key: "org_name", label: "Organization", placeholder: "Venue or org name", required: true },
  { key: "contact_email", label: "Contact email", placeholder: "you@example.com", required: true },
  { key: "name", label: "Event name", placeholder: "Event title", required: true },
  { key: "category", label: "Category", placeholder: "Music, Outdoors…" },
  { key: "day", label: "Day", placeholder: "05", required: true },
  { key: "month", label: "Month", placeholder: "Apr", required: true },
  { key: "time", label: "Time", placeholder: "6:00 PM" },
  { key: "location", label: "Location", placeholder: "Address or venue" },
  { key: "price", label: "Price", placeholder: "Free · From $45" },
  { key: "cta", label: "Button text", placeholder: "Learn More", defaultValue: "Learn More" },
  { key: "bg", label: "Background", type: "color", defaultValue: "#1E3A5F" },
  { key: "image_url", label: "Image URL", placeholder: "Hero image (from submitter upload)" },
  { key: "icon", label: "Icon", placeholder: "Optional" },
  { key: "details", label: "Details", type: "textarea", placeholder: "Submitter notes" },
  {
    key: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  { key: "staff_notes", label: "Staff notes", type: "textarea", placeholder: "Internal" },
];

const columns = ["name", "org_name", "contact_email", "status", "created_at"];

export default function AdminEventSubmissionsPage() {
  return (
    <AdminCrud
      table="event_submissions"
      title="Event submissions"
      fields={fields}
      columns={columns}
      detailBasePath="/admin/event-submissions"
      searchKeys={["name", "org_name", "contact_email", "location"]}
      searchPlaceholder="Search submissions…"
    />
  );
}
