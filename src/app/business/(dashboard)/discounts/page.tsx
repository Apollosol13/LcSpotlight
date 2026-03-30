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
  { key: "title", label: "Offer title", placeholder: "20% off kayak rentals", required: true },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    placeholder: "What customers get and when…",
  },
  {
    key: "terms",
    label: "Terms",
    type: "textarea",
    placeholder: "Restrictions, expiration rules, etc.",
  },
  { key: "redeem_url", label: "Redeem link", placeholder: "https://…" },
  { key: "expires_on", label: "Expires (optional)", type: "date" },
  {
    key: "is_active",
    label: "Visible on deals page",
    type: "boolean",
    defaultValue: true,
  },
];

const columns = ["market_key", "title", "expires_on", "is_active"];

export default function BusinessDiscountsPage() {
  return (
    <AdminCrud
      apiBase="/api/business"
      table="business_discounts"
      title="Your Discounts"
      fields={fields}
      columns={columns}
    />
  );
}
