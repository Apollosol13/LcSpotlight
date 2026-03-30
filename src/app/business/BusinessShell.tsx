"use client";

import { PortalShell } from "@/components/portal/PortalShell";

export function BusinessShell({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
