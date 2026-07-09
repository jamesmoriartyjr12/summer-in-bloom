"use client";

import Image from "next/image";
import { Section } from "../Section";

const BASE = "/Portraits/";

type TeamMember = {
  name: string;
  roles: string[];
  image: string;
  bio: string;
};

const TEAM: TeamMember[] = [
  {
    name: "James Moriarty Jr.",
    roles: ["General Partner"],
    image: `${BASE}James_Portrait.png`,
    bio: "Previously: DraftKings, Chime, OnePay",
  },
  {
    name: "Chris Lovett",
    roles: ["Venture Partner", "Investor Relations"],
    image: `${BASE}Chris_Portrait.png`,
    bio: "Previously: DoorDash",
  },
  {
    name: "Moby Masood",
    roles: ["Venture Partner"],
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
      <div className="flex flex-col gap-[96px] pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] pr-[76px] mobile:pr-[200px] desktop:pr-[248px] xl:pr-[320px]">
        <h2 className="font-display text-h2 leading-none tracking-[-1.6px] max-w-[800px]">
          Built by proven operators, to build alongside proven operators.
        </h2>

        <div className="flex flex-col desktop:flex-row gap-x-[48px] gap-y-[64px]">
          {TEAM.map((member, i) => (
            <div key={i} className="flex flex-col gap-[24px] flex-1 min-w-0">
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
                <p className="font-display text-h4 leading-none tracking-[-0.64px]">
                  {member.name}
                </p>
                <div className="flex flex-wrap items-center gap-[8px]">
                  {member.roles.map((role) => (
                    <div
                      key={role}
                      className="bg-[rgba(196,195,182,0.5)] flex items-center px-[12px] py-[6px] rounded-full"
                    >
                      <p className="text-[12px] font-medium leading-[1.35] uppercase">{role}</p>
                    </div>
                  ))}
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
