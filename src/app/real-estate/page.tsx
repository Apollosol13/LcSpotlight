import type { Metadata } from "next";
import { Suspense } from "react";
import { RealEstateSection } from "@/components/RealEstateSection";

export const metadata: Metadata = {
  title: "Real Estate | Lowcountry Spotlight",
  description:
    "Listings and market trends for Hilton Head Island, Bluffton, Beaufort, and Savannah — sample data from Redfin.",
};

export const revalidate = 300;

export default function RealEstatePage() {
  return (
    <Suspense>
      <RealEstateSection showFullReportsLink={false} maxListingsPerMarket={500} />
    </Suspense>
  );
}
