import type { Metadata } from "next";
import Image from "next/image";
import { stagger } from "@/lib/motion";
import { GlyphIntro } from "./GlyphIntro";
import { LetterBlock } from "./LetterBlock";
import { Callout, Essay, Label, PointList, Rise, Settle } from "./motion";
import { PageGround } from "./PageGround";
import styles from "./manifesto.module.css";

export const metadata: Metadata = {
  title: "Where Product Services Are Going — Bloom",
  description: "A private letter on the state of the studio.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

const POINTS = [
  "Sells adoption and outcomes.",
  "One person designs and ships.",
  "Embedded in the client's team and workflow.",
  "Judgment and trust get more valuable.",
  "Relationship compounds into long-term roles.",
] as const;

export default function ManifestoPage() {
  return (
    <PageGround>
      <main>
        <GlyphIntro />
        <article className={styles.wrap}>
          <header className={styles.header}>
            <Settle className={styles.byline}>
              <Image
                src="/Portraits/James_Portrait.png"
                alt=""
                width={96}
                height={96}
                className={styles.avatar}
                unoptimized
              />
              <div>
                <p className={styles.bylineName}>James</p>
                <p className={styles.bylineRole}>CEO - Bloom Ventures</p>
              </div>
            </Settle>
            <Rise as="h2" className={styles.studio} text="The State of the Studio" />
            <Rise
              as="h1"
              className={styles.title}
              text="Where product services are going"
              delay={stagger.section}
            />
          </header>

          <section className={styles.chapter}>
            <Rise as="h2" className={styles.chapterMark} text="The shift" />
            <LetterBlock>
            <div className={styles.prose}>
            <p>
              The agency model built on billing hours to produce screens is ending. AI now writes the
              code and drafts the designs, so output is cheap and abundant.
            </p>
            <p>
              What stays scarce is getting software adopted. Enterprises are funding AI pilots at
              record pace, and most stall before production. They rarely stall on the model. They stall
              on the interface, the workflow, and the people who have to use it every day.
            </p>
            </div>
            </LetterBlock>
            <Rise as="p" className={`${styles.pull} ${styles.prose}`} text="Value is moving from making things to making things land." />
          </section>

          <section className={styles.chapter}>
            <Label className={styles.leader}>What wins next</Label>
            <Rise as="h2" className={styles.chapterMark} text="The forward deployed design engineer" />
            <div className={styles.prose}>
            <LetterBlock>
            <p>
              The model that wins is one person who designs and ships, embedded in the client&apos;s
              team. Palantir proved the forward deployed engineer for data. The AI era needs the same
              role for the interface.
            </p>
            </LetterBlock>
            <PointList lines={POINTS} />
            <Callout />
            </div>
          </section>

          <section className={styles.chapter}>
            <Label className={styles.leader}>A letter</Label>
            <Rise as="h2" className={styles.chapterMark} text="To the people who make it land" />
            <Essay />
          </section>

          <footer className={`${styles.footer} ${styles.prose}`}>
            Confidential. Prepared for a private conversation. Please do not distribute.
          </footer>
        </article>
      </main>
    </PageGround>
  );
}
