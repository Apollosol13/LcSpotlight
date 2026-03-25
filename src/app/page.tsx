import { Suspense } from "react";
import { Hero } from "@/components/Hero";
import { Ticker } from "@/components/Ticker";
import { InlineCTA } from "@/components/InlineCTA";
import { EventsSection } from "@/components/EventsSection";
import { OpeningsSection } from "@/components/OpeningsSection";
import { NewsSection } from "@/components/NewsSection";
import { ThingsToDoSection } from "@/components/ThingsToDoSection";
import { RealEstateSection } from "@/components/RealEstateSection";
import { TicketingBanner } from "@/components/TicketingBanner";

export const revalidate = 300;

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <InlineCTA />
      <Suspense>
        <EventsSection />
      </Suspense>
      <Suspense>
        <OpeningsSection />
      </Suspense>
      <Suspense>
        <NewsSection />
      </Suspense>
      <Suspense>
        <ThingsToDoSection />
      </Suspense>
      <Suspense>
        <RealEstateSection />
      </Suspense>
      <TicketingBanner />
    </>
  );
}
