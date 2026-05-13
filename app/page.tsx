import { SectionProvider } from "@/components/SectionContext";
import { SideNav } from "@/components/SideNav";
import { LenisProvider } from "@/components/LenisProvider";
import { Hero } from "@/components/sections/Hero";
import { FundDetails } from "@/components/sections/FundDetails";
import { FundThesis } from "@/components/sections/FundThesis";

export default function Page() {
  return (
    <LenisProvider>
      <SectionProvider>
        <main>
          <Hero />
          <FundDetails />
          <FundThesis />
        </main>
        <SideNav />
      </SectionProvider>
    </LenisProvider>
  );
}
