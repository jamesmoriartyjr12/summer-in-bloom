"use client";

import { Section } from "../Section";

export function Hero() {
  return (
    <Section
      id="hero"
      theme="dark"
      className="sticky top-0 z-0 flex flex-col text-chalk overflow-hidden h-screen desktop:min-h-[716px] bg-black"
    >
      {/* Video background — replace src with your provided video file */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="/hero-poster.jpg"
      >
        <source src="/summer-bloom-hero.webm" type="video/webm" />
      </video>

      {/* Spacer pushes content to the bottom */}
      <div className="relative z-10 flex-1" />

      {/* Text block — anchored to bottom-left */}
      <div className="relative z-10 flex flex-col gap-[96px] p-[24px] mobile:p-[48px]">
        <p className="text-p1 max-w-[448px]">
          We built this fund to give our LPs exposure to the success of our
          studio, where we work side by side with early-stage companies and
          guide them through hypergrowth.
        </p>
        <div className="flex items-end justify-between">
          <h1 className="font-display text-[clamp(60px,18vw,200px)] leading-[0.95] tracking-[-4px]">
            Summer<br /> in Bloom
          </h1>
          <span className="text-l1 pb-[6px]">Flagship Fund One</span>
        </div>
      </div>
    </Section>
  );
}
