import { redirect } from "next/navigation";
import { Suspense } from "react";
import { isInviteGateEnabled } from "@/lib/membership-access";
import { AccessFormClient } from "./AccessFormClient";

export default function AccessPage() {
  if (!isInviteGateEnabled()) {
    redirect("/subscribe");
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotlight-gold border-t-transparent" />
        </div>
      }
    >
      <AccessFormClient />
    </Suspense>
  );
}
