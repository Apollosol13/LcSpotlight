import { AdminCrud, type FieldDef } from "@/components/admin/AdminCrud";

const fields: FieldDef[] = [
  { key: "name", label: "Business Name", placeholder: "The Marsh House Brasserie", required: true },
  { key: "type", label: "Type", placeholder: "Restaurant · French-Southern", required: true },
  { key: "location", label: "Location", placeholder: "Coligny Plaza, HHI", required: true },
  { key: "icon", label: "Icon", placeholder: "Emoji or symbol" },
];

const columns = ["name", "type", "location", "source"];

export default function AdminOpeningsPage() {
  return (
    <AdminCrud
      table="openings"
      title="Openings"
      fields={fields}
      columns={columns}
    />
  );
}
