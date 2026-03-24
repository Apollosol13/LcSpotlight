import { Hero } from "@/components/Hero";
import { Ticker } from "@/components/Ticker";
import { EventsSection } from "@/components/EventsSection";
import { OpeningsSection } from "@/components/OpeningsSection";
import { NewsSection } from "@/components/NewsSection";
import { ThingsToDoSection } from "@/components/ThingsToDoSection";
import { RealEstateSection } from "@/components/RealEstateSection";
import { TicketingBanner } from "@/components/TicketingBanner";
import { Newsletter } from "@/components/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <EventsSection />
      <hr className="m-0 border-0 border-t border-[rgba(12,27,51,0.1)]" />
      <OpeningsSection />
      <hr className="m-0 border-0 border-t border-[rgba(12,27,51,0.1)]" />
      <NewsSection />
      <hr className="m-0 border-0 border-t border-[rgba(12,27,51,0.1)]" />
      <ThingsToDoSection />
      <RealEstateSection />
      <TicketingBanner />
      <Newsletter />
    </>
  );
}
