/** Single uppercase letter for type/name display (no emoji). */
export function typeOrNameInitial(
  type: string | null | undefined,
  name: string | null | undefined,
): string {
  const fromType = (type?.replace(/[^A-Za-z]/g, "").charAt(0) || "").toUpperCase();
  if (fromType) return fromType;
  const c = name?.match(/[A-Za-z]/)?.[0];
  return (c || "?").toUpperCase();
}

export function titleInitial(title: string | null | undefined): string {
  const c = title?.match(/[A-Za-z]/)?.[0];
  return (c || "?").toUpperCase();
}
