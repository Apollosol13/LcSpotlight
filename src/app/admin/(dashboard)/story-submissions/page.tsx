import { AdminCrud, type FieldDef } from "@/components/admin/AdminCrud";

const fields: FieldDef[] = [
  { key: "name", label: "Name", placeholder: "Submitter name", required: true },
  { key: "email", label: "Email", placeholder: "email@example.com", required: true },
  { key: "title", label: "Headline", placeholder: "Story subject", required: true },
  { key: "body", label: "Pitch", type: "textarea", placeholder: "Full submission text…", required: true },
  {
    key: "status",
    label: "Status",
    placeholder: "pending · reviewed · archived",
    required: true,
  },
  { key: "staff_notes", label: "Staff notes", type: "textarea", placeholder: "Internal notes (not public)" },
];

const columns = ["title", "name", "email", "status", "created_at"];

export default function AdminStorySubmissionsPage() {
  return (
    <AdminCrud
      table="story_submissions"
      title="Story submissions"
      fields={fields}
      columns={columns}
    />
  );
}
