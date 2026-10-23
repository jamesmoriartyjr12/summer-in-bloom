import type { Metadata } from "next";
import Image from "next/image";
import { stagger } from "@/lib/motion";
import { GlyphIntro } from "./GlyphIntro";
import { LetterBlock } from "./LetterBlock";
import { Callout, Essay, GeneList, Label, PointList, Rise, Settle } from "./motion";
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

const GENES = [
  {
    name: "Entrepreneurial",
    body: "Thinks like an owner, spots the growth signal, and acts on it.",
  },
  {
    name: "Technical",
    body: "Ships production software, using AI-native tools to move faster.",
  },
  {
    name: "Tasteful",
    body: "Judgment in the craft is what makes people want to use what ships.",
    tag: "Most important",
  },
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
            <Rise as="h2" className={styles.chapterMark} text="The new genome of a product team" />
            <LetterBlock>
            <div className={styles.prose}>
            <p>
              The genetic makeup of software teams is being rebuilt. The builder and the full-stack
              engineer form the new partnership of the future.
            </p>
            <p>We believe a builder carries three genes:</p>
            </div>
            </LetterBlock>
            <GeneList genes={GENES} />
            <Rise
              as="p"
              className={`${styles.pull} ${styles.prose}`}
              text="The people who carry all three are, predominantly, forward deployed design engineers."
            />
          </section>

          <section className={styles.chapter}>
            <Label className={styles.leader}>What wins next</Label>
            <Rise as="h2" className={styles.chapterMark} text="The forward deployed design engineer" />
            <div className={styles.prose}>
            <LetterBlock>
            <p>
              The product teams that win will ship, set the pace, read the growth signals, and adapt,
              using AI-native workflows and tools to get there faster. That team works embedded in the
              client&apos;s business, and one person both designs and ships. Palantir proved the forward
              deployed engineer for data. The AI era needs the same role for the product.
            </p>
            </LetterBlock>
            <PointList lines={POINTS} />
            <Callout />
            </div>
          </section>

          <section className={styles.chapter}>
            <Rise as="h2" className={styles.chapterMark} text="Where Bloom sits" />
            <Essay />
          </section>

          <section className={styles.chapter}>
            <Rise as="h2" className={styles.chapterMark} text="The opportunity" />
            <LetterBlock>
            <div className={styles.prose}>
            <p>
              An owner of Bloom gets an operating studio and a head start on a new category. The next
              step is to scale the model: more forward deployed teams, placed in more enterprises and
              early-stage companies that are trying to make AI work.
            </p>
            <p className={styles.pull}>
              The agencies that keep selling hours will shrink. The studios that sell adoption will set
              the price. Bloom is built to be one of them.
            </p>
            </div>
            </LetterBlock>
            <Settle>
              <p className={styles.signoff}>James</p>
            </Settle>
          </section>

          <footer className={`${styles.footer} ${styles.prose}`}>
            Confidential. Prepared for a private conversation. Please do not distribute.
          </footer>
        </article>
      </main>
    </PageGround>
  );
}
