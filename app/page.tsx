import { SectionProvider } from "@/components/SectionContext";
import { SideNav } from "@/components/SideNav";
import { TopNav } from "@/components/TopNav";
import { LenisProvider } from "@/components/LenisProvider";
import { Hero } from "@/components/sections/Hero";
import { FundDetails } from "@/components/sections/FundDetails";
import { FundThesis } from "@/components/sections/FundThesis";
import { CurrentPortfolio } from "@/components/sections/CurrentPortfolio";
import { InTheNews } from "@/components/sections/InTheNews";
import { Contact } from "@/components/sections/Contact";

export default function Page() {
  return (
    <LenisProvider>
      <SectionProvider>
        <main>
          <div className="mobile-nav-shift">
            <Hero />
            <FundDetails />
            <FundThesis />
            <CurrentPortfolio />
            <InTheNews />
            <FundDetails id="fund-details-2" />
            <Contact />
          </div>
        </main>
        <TopNav />
        <SideNav />
      </SectionProvider>
    </LenisProvider>
  );
}
