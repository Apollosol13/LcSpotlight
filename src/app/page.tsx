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
import { Newsletter } from "@/components/Newsletter";

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
      <hr className="m-0 border-0 border-t border-[rgba(12,27,51,0.1)]" />
      <Suspense>
        <OpeningsSection />
      </Suspense>
      <hr className="m-0 border-0 border-t border-[rgba(12,27,51,0.1)]" />
      <Suspense>
        <NewsSection />
      </Suspense>
      <hr className="m-0 border-0 border-t border-[rgba(12,27,51,0.1)]" />
      <Suspense>
        <ThingsToDoSection />
      </Suspense>
      <RealEstateSection />
      <TicketingBanner />
      <Newsletter />
    </>
  );
}
