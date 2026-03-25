import { AdminCrud, type FieldDef } from "@/components/admin/AdminCrud";

const fields: FieldDef[] = [
  { key: "title", label: "Title", placeholder: "Dolphin Kayak Tour", required: true },
  { key: "badge", label: "Badge / Deal", placeholder: "30% OFF, BOGO, FREE...", required: true },
  { key: "description", label: "Description", type: "textarea", placeholder: "2-hour guided kayak tour..." },
  { key: "venue", label: "Venue", placeholder: "Outside Hilton Head" },
  { key: "expires", label: "Expires / Schedule", placeholder: "Expires Apr 30" },
  { key: "icon", label: "Icon", placeholder: "Emoji or symbol" },
];

const columns = ["title", "badge", "venue", "expires", "source"];

export default function AdminThingsToDoPage() {
  return (
    <AdminCrud
      table="things_to_do"
      title="Things To Do"
      fields={fields}
      columns={columns}
    />
  );
}
