"use client";

import Image from "next/image";
import { Section } from "../Section";
import { SectionContent } from "../SectionContent";

const CONTACT_IMAGE =
  "https://www.figma.com/api/mcp/asset/2629b7dc-4eb2-4416-bab1-f33ae3820167";

const CONTACTS = [
  {
    name: "James Moriarty Jr.",
    role: "Founder",
    email: "james@bloomventures.com",
    phone: "Phone number",
  },
  {
    name: "Chris Lovett",
    role: "Head of Growth",
    email: "chris@bloomventures.com",
    phone: "(413) 636 6749",
  },
];

export function Contact() {
  return (
    <Section
      id="contact"
      theme="light"
      className="relative z-10 bg-chalk text-black pt-[200px] pb-[96px]"
    >
      <div className="flex flex-col gap-[48px] desktop:gap-[96px]">
        {/* Title — starts at image edge, spans both columns */}
        <div className="pl-[76px] mobile:pl-[200px] desktop:pl-[248px] xl:pl-[320px] pr-[48px]">
          <h2 className="font-display text-h2 leading-none tracking-[-1.6px] max-w-[850px]">
            Talk to us
          </h2>
        </div>

        {/* Image + contact list */}
        <SectionContent
          flushRight
          left={
            <div className="sticky top-[96px] h-[400px] overflow-hidden">
              <Image
                src={CONTACT_IMAGE}
                alt=""
                fill
                sizes="336px"
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          }
        >
          <div className="flex flex-col">
            {/* Mobile image — hidden on desktop where sticky left column takes over */}
            <div className="desktop:hidden aspect-[4/3] w-full overflow-hidden relative mb-[48px]">
              <Image
                src={CONTACT_IMAGE}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            <p className="text-l2 font-medium uppercase">Contact</p>

            <div className="flex flex-col gap-[96px]">
              {CONTACTS.map((contact) => (
                <div key={contact.name} className="flex flex-col">
                  <div className="flex flex-col gap-[24px] mobile:flex-row mobile:items-start mobile:justify-between pt-[24px] pb-[8px] pr-[24px] mobile:pr-[48px]">
                    <p className="font-display text-h4 leading-none tracking-[-0.64px]">
                      {contact.name}
                    </p>
                    <div className="bg-[rgba(196,195,182,0.5)] flex items-center px-[12px] py-[6px] rounded-full shrink-0 self-start">
                      <p className="text-[12px] font-medium leading-[1.35] uppercase">
                        {contact.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col py-[24px] border-b border-beige">
                    <p className="text-p1">{contact.email}</p>
                  </div>
                  <div className="flex flex-col py-[24px] border-b border-beige">
                    <p className="text-p1">{contact.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionContent>
      </div>
    </Section>
  );
}
