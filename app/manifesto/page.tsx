import type { Metadata } from "next";
import { GlyphIntro } from "./GlyphIntro";
import { LetterBlock } from "./LetterBlock";
import { PageGround } from "./PageGround";
import styles from "./manifesto.module.css";

export const metadata: Metadata = {
  title: "The State of the Studio — Bloom",
  description: "Where product services are going, and why Bloom is built for what comes next.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

const TURNS = [
  ["Sells hours and deliverables.", "Sells adoption and outcomes."],
  ["Designers hand off to engineers.", "One person designs and ships."],
  ["Works from a brief, outside the client.", "Embedded in the client's team and workflow."],
  ["Output gets cheaper every year with AI.", "Judgment and trust get more valuable."],
  ["Project ends, relationship resets.", "Relationship compounds into long-term roles."],
] as const;

export default function ManifestoPage() {
  return (
    <PageGround>
      <main>
        <GlyphIntro />
        <article className={styles.wrap}>
          <LetterBlock as="header" className={styles.header}>
            <p className={styles.eyebrow}>Bloom Growth Agency · Private</p>
            <h1 className={styles.title}>The State of the Studio</h1>
            <div className={styles.prose}>
              <p className={styles.dek}>
                Where product services are going, and why Bloom is built for what comes next.
              </p>
              <p className={styles.meta}>October 2026 · James, Bloom Growth Agency</p>
            </div>
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
            <h2 className={styles.chapterMark}>
              What wins next: the forward deployed design engineer
            </h2>
            <div className={styles.prose}>
            <p>
              The model that wins is one person who designs and ships, embedded in the client&apos;s
              team. Palantir proved the forward deployed engineer for data. The AI era needs the same
              role for the interface.
            </p>
            <div className={styles.turns}>
              {TURNS.map(([before, after]) => (
                <p key={before}>
                  <span className={styles.before}>{before}</span>{" "}
                  <span className={styles.after}>{after}</span>
                </p>
              ))}
            </div>
            <p>
              No major firm has claimed this category yet. The window to own it is open now, and it
              closes once larger players formalize it.
            </p>
            </div>
          </LetterBlock>

          <LetterBlock as="section" className={styles.chapter}>
            <h2 className={styles.chapterMark}>Where Bloom sits</h2>
            <div className={styles.prose}>
            <p>
              Bloom has run this model for six years, before it had a name. Our team of about 12 works
              embedded at the line between design and engineering, which is exactly where AI products
              succeed or fail.
            </p>
            <p>The market is already paying for it.</p>
            </div>
          </LetterBlock>

          <LetterBlock className={styles.momentum}>
            <div className={styles.prose}>
            <p className={styles.figure}>+25%</p>
            <p className={styles.figureNote}>
              Revenue, year to date (Jan–Sep), up from +21% last year
            </p>
            <p className={styles.figure}>+48%</p>
            <p className={styles.figureNote}>
              Net income, year to date (Jan–Sep), after +45% last year
            </p>
            </div>
          </LetterBlock>

          <LetterBlock as="section" className={styles.chapter}>
            <div className={styles.prose}>
            <p>
              <strong>Proven model, not a pivot.</strong> Embedded delivery is how we already work, so
              the positioning describes the business we run.
            </p>
            <p>
              <strong>Built for the AI moment.</strong> Our people use AI to ship faster, so each
              person delivers more as the tools improve.
            </p>
            <p>
              <strong>Category ownership.</strong> We are putting a name on the forward deployed
              design engineer, in public, before anyone else does.
            </p>
            <p>
              <strong>Compounding relationships.</strong> Embedded teams become trusted, which turns
              projects into long-running engagements.
            </p>
            </div>
          </LetterBlock>

          <LetterBlock as="section" className={styles.chapter}>
            <h2 className={styles.chapterMark}>The opportunity</h2>
            <div className={styles.prose}>
            <p>
              An owner of Bloom gets an operating studio and a head start on a new category. The next
              step is to scale the model: more forward deployed teams, placed in more enterprises that
              are trying to make AI work.
            </p>
            <p className={styles.close}>
              The agencies that keep selling hours will shrink. The studios that sell adoption will set
              the price. Bloom is built to be one of them.
            </p>
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
