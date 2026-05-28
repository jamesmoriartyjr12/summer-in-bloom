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
    role: "Founder",
    image: `${BASE}James_Portrait.png`,
    bio: "Lorem ipsum dolor sit amet consectetur. Sem eu lorem proin diam mauris integer. Feugiat aliquet tempor rhoncus metus dignissim arcu eget. Id enim libero diam faucibus turpis phasellus non. Sed vitae eget nunc fermentum malesuada integer enim. Posuere bibendum vulputate leo non pharetra augue et venenatis.",
  },
  {
    name: "Chris Lovett",
    role: "Head of Growth",
    image: `${BASE}Chris_Portrait.png`,
    bio: "Lorem ipsum dolor sit amet consectetur. Elit ac ultrices sit egestas. Quam sollicitudin semper ornare integer nulla. Tortor iaculis fermentum sagittis massa massa. Lectus commodo nisl ornare at. At ut magna arcu est vitae tellus. Nisl duis adipiscing sit sit egestas pellentesque arcu quis fringilla.",
  },
  {
    name: "Moby Masood",
    role: "Partner",
    image: `${BASE}Moby_Portrait.png`,
    bio: "Lorem ipsum dolor sit amet consectetur. Magnis massa amet nunc laoreet. Tellus sed turpis commodo massa nisl tincidunt non duis massa. Quisque ac sollicitudin rhoncus odio mauris sapien. Donec mattis congue eget mus nibh laoreet arcu consectetur non. Ultricies cursus pretium at faucibus etiam arcu hac lorem.",
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
          About us
        </h2>

        <div className="flex flex-col">
          {TEAM.map((member, i) => (
            <div
              key={i}
              className={`flex flex-col desktop:flex-row desktop:items-center gap-[48px] desktop:gap-[48px] border-b border-beige pr-[0] desktop:pr-[48px] ${i === 0 ? "pb-[48px]" : "py-[48px]"}`}
            >
              <div className="w-full desktop:w-[336px] shrink-0 aspect-[14/9] bg-beige relative overflow-hidden">
                <Image src={member.image} alt={member.name} fill className="object-cover" unoptimized />
              </div>
              <div className="flex flex-col gap-[32px] flex-1 min-w-0 pr-[24px] mobile:pr-[48px] desktop:pr-0">
                <div className="flex items-center justify-between">
                  <p className="font-display text-h4 leading-none tracking-[-0.64px]">
                    {member.name}
                  </p>
                  <div className="bg-[rgba(196,195,182,0.5)] self-start flex items-center px-[12px] py-[6px] rounded-full shrink-0">
                    <p className="text-[12px] font-medium leading-[1.35] uppercase">{member.role}</p>
                  </div>
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
