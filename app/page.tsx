import { SectionProvider } from "@/components/SectionContext";
import { SideNav } from "@/components/SideNav";
import { TopNav } from "@/components/TopNav";
import { LenisProvider } from "@/components/LenisProvider";
import { Hero } from "@/components/sections/Hero";
import { FundDetails } from "@/components/sections/FundDetails";
import { FundThesis } from "@/components/sections/FundThesis";
import { Pipeline } from "@/components/sections/Pipeline";
import { CurrentPortfolio } from "@/components/sections/CurrentPortfolio";

export default function Page() {
  return (
    <LenisProvider>
      <SectionProvider>
        <main>
          <Hero />
          <FundDetails />
          <FundThesis />
          <Pipeline />
          <CurrentPortfolio />
        </main>
        <TopNav />
        <SideNav />
      </SectionProvider>
    </LenisProvider>
  );
}
