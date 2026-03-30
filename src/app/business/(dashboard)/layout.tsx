import { BusinessShell } from "../BusinessShell";

export default function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BusinessShell>{children}</BusinessShell>;
}
