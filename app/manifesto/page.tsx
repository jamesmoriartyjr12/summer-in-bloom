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

export default function ManifestoPage() {
  return (
    <PageGround>
      <main>
        <GlyphIntro />
        <article className={styles.wrap}>
          <LetterBlock as="header" className={styles.header}>
            <p className={styles.eyebrow}>Bloom Growth Agency · Private</p>
            <h1 className={styles.title}>The State of the Studio</h1>
            <p className={styles.dek}>
              Where product services are going, and why Bloom is built for what comes next.
            </p>
            <p className={styles.meta}>October 2026 · James, Bloom Growth Agency</p>
          </LetterBlock>

          <LetterBlock as="section" className={styles.section}>
            <p className={styles.num}>01</p>
            <h2 className={styles.sectionTitle}>The shift</h2>
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
          </LetterBlock>

          <LetterBlock as="section" className={styles.section}>
            <p className={styles.num}>02</p>
            <h2 className={styles.sectionTitle}>
              What wins next: the forward deployed design engineer
            </h2>
            <p>
              The model that wins is one person who designs and ships, embedded in the client&apos;s
              team. Palantir proved the forward deployed engineer for data. The AI era needs the same
              role for the interface.
            </p>
            <table className={styles.compare}>
              <thead>
                <tr>
                  <th>Old agency</th>
                  <th>Forward deployed studio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sells hours and deliverables</td>
                  <td>Sells adoption and outcomes</td>
                </tr>
                <tr>
                  <td>Designers hand off to engineers</td>
                  <td>One person designs and ships</td>
                </tr>
                <tr>
                  <td>Works from a brief, outside the client</td>
                  <td>Embedded in the client&apos;s team and workflow</td>
                </tr>
                <tr>
                  <td>Output gets cheaper every year with AI</td>
                  <td>Judgment and trust get more valuable</td>
                </tr>
                <tr>
                  <td>Project ends, relationship resets</td>
                  <td>Relationship compounds into long-term roles</td>
                </tr>
              </tbody>
            </table>
            <p>
              No major firm has claimed this category yet. The window to own it is open now, and it
              closes once larger players formalize it.
            </p>
          </LetterBlock>

          <LetterBlock as="section" className={styles.section}>
            <p className={styles.num}>03</p>
            <h2 className={styles.sectionTitle}>Where Bloom sits</h2>
            <p>
              Bloom has run this model for six years, before it had a name. Our team of about 12 works
              embedded at the line between design and engineering, which is exactly where AI products
              succeed or fail.
            </p>
            <p>
              <strong>The market is already paying for it.</strong>
            </p>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statValue}>+25%</div>
                <div className={styles.statLabel}>
                  Revenue, year to date (Jan–Sep), up from +21% last year
                </div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>+48%</div>
                <div className={styles.statLabel}>
                  Net income, year to date (Jan–Sep), after +45% last year
                </div>
              </div>
            </div>
            <ul className={styles.points}>
              <li>
                <strong>Proven model, not a pivot.</strong> Embedded delivery is how we already work,
                so the positioning describes the business we run.
              </li>
              <li>
                <strong>Built for the AI moment.</strong> Our people use AI to ship faster, so each
                person delivers more as the tools improve.
              </li>
              <li>
                <strong>Category ownership.</strong> We are putting a name on the forward deployed
                design engineer, in public, before anyone else does.
              </li>
              <li>
                <strong>Compounding relationships.</strong> Embedded teams become trusted, which turns
                projects into long-running engagements.
              </li>
            </ul>
          </LetterBlock>

          <LetterBlock as="section" className={styles.section}>
            <p className={styles.num}>04</p>
            <h2 className={styles.sectionTitle}>The opportunity</h2>
            <p>
              An owner of Bloom gets an operating studio and a head start on a new category. The next
              step is to scale the model: more forward deployed teams, placed in more enterprises that
              are trying to make AI work.
            </p>
            <div className={styles.close}>
              The agencies that keep selling hours will shrink. The studios that sell adoption will set
              the price. Bloom is built to be one of them.
            </div>
          </LetterBlock>

          <footer className={styles.footer}>
            Confidential. Prepared for a private conversation. Please do not distribute.
          </footer>
        </article>
      </main>
    </PageGround>
  );
}
