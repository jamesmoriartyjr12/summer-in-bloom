"use client";

import Image from "next/image";
import { Section } from "../Section";

const BASE = "/Portraits/";

type TeamMember = {
  name: string;
  role: string;
  image: string;
  bio: string;
};

const TEAM: TeamMember[] = [
  {
    name: "James Moriarty Jr.",
    role: "General Partner",
    image: `${BASE}James_Portrait.png`,
    bio: "Previously: DraftKings, Chime, OnePay",
  },
  {
    name: "Chris Lovett",
    role: "Venture Partner and Investor Relations",
    image: `${BASE}Chris_Portrait.png`,
    bio: "Previously: DoorDash",
  },
  {
    name: "Moby Masood",
    role: "Venture Partner",
    image: `${BASE}Moby_Portrait.png`,
    bio: "Previously: Snowflake",
  },
];

export function AboutUs() {
  return (
    <Section
      id="about-us"
      theme="light"
      className="relative z-10 bg-chalk text-black pt-[200px] pb-[96px]"
    >
      <div className="flex flex-col gap-[96px] pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px]">
        <h2 className="font-display text-h2 leading-none tracking-[-1.6px] max-w-[800px] pr-[24px] mobile:pr-[48px]">
          Built by proven operators, to build alongside proven operators.
        </h2>

        <div className="grid grid-cols-1 desktop:grid-cols-3 gap-x-[48px] gap-y-[64px] pr-[24px] mobile:pr-[48px] desktop:pr-[48px]">
          {TEAM.map((member, i) => (
            <div key={i} className="flex flex-col gap-[24px]">
              <div
                className="w-full aspect-[4/5] bg-beige relative overflow-hidden"
                style={{
                  clipPath:
                    "polygon(28px 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 0 100%, 0 28px)",
                }}
              >
                <Image src={member.image} alt={member.name} fill className="object-cover" unoptimized />
              </div>
              <div className="flex flex-col gap-[16px]">
                <p className="font-condensed uppercase text-h4 leading-[0.9] tracking-[-0.5px]">
                  {member.name}
                </p>
                <div className="bg-[rgba(196,195,182,0.5)] self-start flex items-center px-[12px] py-[6px] rounded-full">
                  <p className="text-[12px] font-medium leading-[1.35] uppercase">{member.role}</p>
                </div>
                <p className="text-[16px] leading-[1.5]">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
