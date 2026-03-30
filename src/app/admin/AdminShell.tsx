"use client";

import { PortalShell } from "@/components/portal/PortalShell";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return <PortalShell showAdminSubNav>{children}</PortalShell>;
}
