import type { Metadata } from "next";
import Image from "next/image";
import { GlyphIntro } from "./GlyphIntro";
import { LetterBlock } from "./LetterBlock";
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
          <LetterBlock as="header" className={styles.header}>
            <div className={styles.byline}>
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
            </div>
            <h2 className={styles.studio}>The State of the Studio</h2>
            <h1 className={styles.title}>Where product services are going</h1>
          </LetterBlock>

          <LetterBlock as="section" className={styles.chapter}>
            <h2 className={styles.chapterMark}>The shift</h2>
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
            <p className={styles.pull}>Value is moving from making things to making things land.</p>
            </div>
          </LetterBlock>

          <LetterBlock as="section" className={styles.chapter}>
            <p className={styles.leader}>What wins next</p>
            <h2 className={styles.chapterMark}>The forward deployed design engineer</h2>
            <div className={styles.prose}>
            <p>
              The model that wins is one person who designs and ships, embedded in the client&apos;s
              team. Palantir proved the forward deployed engineer for data. The AI era needs the same
              role for the interface.
            </p>
            <ul className={styles.points}>
              {POINTS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className={styles.callout}>
              <span className={styles.calloutLead}>No major firm has claimed this category yet.</span>
              <span className={styles.calloutRest}>
                The window to own it is <em>open now</em>, and it closes once larger players formalize
                it.
              </span>
            </p>
            </div>
          </LetterBlock>

          <LetterBlock as="section" className={styles.chapter}>
            <p className={styles.leader}>A letter</p>
            <h2 className={styles.chapterMark}>To the people who make it land</h2>
            <div className={`${styles.prose} ${styles.essay}`}>
              <p>
                Bloom has run this model for six years, before it had a name. There are about twelve of
                us. We sit inside the client&apos;s team, on the line between design and engineering.
                That is the line where an AI product either gets used or becomes another pilot that
                never ships.
              </p>
              <p>
                I am writing to the people who taught me that line. The designer who will not call a
                flow done until someone has actually walked it. The engineer who stays in the critique
                because the interface is their work too. The operator who knows the Tuesday morning the
                software has to survive. AI can draft the screens. It cannot care whether they land.
                That care is still the craft, and I want the next decade of this industry to belong to
                the people who still practice it.
              </p>
              <p>The market is already paying for that care.</p>
              <p className={styles.figure}>+25%</p>
              <p className={styles.figureNote}>
                Revenue, year to date (Jan–Sep), up from +21% last year
              </p>
              <p className={styles.figure}>+48%</p>
              <p className={styles.figureNote}>
                Net income, year to date (Jan–Sep), after +45% last year
              </p>
              <p>
                This is a proven model, not a pivot. Embedded delivery is how we already work, so the
                name describes the business we run. Our people use AI to ship faster, and each person
                delivers more as the tools improve. We are putting a name on the forward deployed
                design engineer, in public, before anyone else does. And the relationship does not
                reset when the project ends. It compounds. Trust turns a brief into a long role, and a
                long role into the team they call when the next hard thing shows up.
              </p>
              <p>
                An owner of Bloom gets an operating studio and a head start on a category that is still
                open. The next step is the one I most want: more forward deployed teams, placed with
                more enterprises that are trying to make AI work, staffed by people who love the
                making.
              </p>
              <p>
                The agencies that keep selling hours will shrink. The studios that sell adoption will
                set the price. Bloom is built to be one of them. I hope the industry I love is the one
                that gets there first.
              </p>
              <p className={styles.signoff}>James</p>
            </div>
          </LetterBlock>

          <footer className={`${styles.footer} ${styles.prose}`}>
            Confidential. Prepared for a private conversation. Please do not distribute.
          </footer>
        </article>
      </main>
    </PageGround>
  );
}
