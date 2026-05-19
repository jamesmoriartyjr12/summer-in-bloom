"use client";

import { Section } from "../Section";
import { SectionContent } from "../SectionContent";

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
      theme="dark"
      className="relative z-10 bg-black text-chalk py-[200px]"
    >
      <SectionContent flushRight>
        <div className="flex flex-col gap-[96px]">
          <h2 className="font-display text-h2 leading-none tracking-[-1.6px]">
            Talk to us
          </h2>
          <div className="flex flex-col gap-[96px]">
            {CONTACTS.map((contact) => (
              <div key={contact.name} className="flex flex-col">
                <div className="flex flex-col gap-[16px] mobile:flex-row mobile:items-start mobile:justify-between pt-[24px] pb-[8px] pr-[48px]">
                  <p className="font-display text-h4 leading-none tracking-[-0.64px]">
                    {contact.name}
                  </p>
                  <div className="bg-chalk-25 flex items-center px-[12px] py-[6px] rounded-full shrink-0 self-start">
                    <p className="text-[12px] font-medium leading-[1.35] uppercase">
                      {contact.role}
                    </p>
                  </div>
                </div>
                <div className="py-[24px] border-b border-chalk-25">
                  <p className="text-p1">{contact.email}</p>
                </div>
                <div className="py-[24px] border-b border-chalk-25">
                  <p className="text-p1">{contact.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionContent>
    </Section>
  );
}
