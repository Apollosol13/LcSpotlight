export type FounderInfo = {
  name: string;
  title: string;
  email: string;
  /** Digits only (e.g. 8435551234) for tel: links */
  phoneDigits: string;
};

export const FOUNDERS: FounderInfo[] = [
  {
    name: "Brennen Studenc",
    title: "Co-founder",
    email: "brennen@twodudesandai.com",
    phoneDigits: "8433843816",
  },
  {
    name: "Jacob Weaver",
    title: "Co-founder",
    email: "jacobweaver@twodudesandai.com",
    phoneDigits: "8438146033",
  },
];

/** Optional team inbox shown on the contact page when set */
export const DEFAULT_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "";

export function formatPhoneDisplay(phoneDigits: string): string {
  const d = phoneDigits.replace(/\D/g, "");
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return phoneDigits;
}

export function phoneTelHref(phoneDigits: string): string {
  const d = phoneDigits.replace(/\D/g, "");
  if (d.length === 10) return `tel:+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `tel:+${d}`;
  return `tel:${d}`;
}
