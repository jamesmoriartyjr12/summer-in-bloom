"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { chromeSnap, enter, punch, stagger } from "@/lib/motion";
import styles from "./manifesto.module.css";

const viewport = { once: true, margin: "0px 0px -8% 0px" } as const;

function usePlay() {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return ready && reduce === false;
}

const riseEase = {
  duration: enter.duration,
  ease: enter.ease,
};

type Tag = "h1" | "h2" | "p" | "span";

export function Rise({
  as,
  text,
  className,
  delay = 0,
}: {
  as: Tag;
  text: string;
  className?: string;
  delay?: number;
}) {
  const play = usePlay();
  const TagName = as;

  if (!play) {
    return <TagName className={className}>{text}</TagName>;
  }

  const MotionTag = motion[as];
  const words = text.split(" ");

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger.labels, delayChildren: delay },
        },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          className={styles.clip}
          key={`${word}-${i}`}
          variants={{ hidden: {}, show: {} }}
        >
          <motion.span
            className={styles.clipWord}
            variants={{
              hidden: { y: "110%" },
              show: { y: "0%", transition: riseEase },
            }}
          >
            {word}
          </motion.span>
        </motion.span>
      ))}
    </MotionTag>
  );
}

export function Settle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const play = usePlay();

  if (!play) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={viewport}
      transition={{ duration: chromeSnap.duration, ease: chromeSnap.ease }}
    >
      {children}
    </motion.div>
  );
}

export function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  const play = usePlay();

  if (!play) {
    return <p className={className}>{children}</p>;
  }

  return (
    <motion.p
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={viewport}
      transition={{ duration: chromeSnap.duration, ease: chromeSnap.ease }}
    >
      {children}
    </motion.p>
  );
}

const line = {
  hidden: { opacity: 0, y: enter.distance },
  show: {
    opacity: 1,
    y: 0,
    transition: riseEase,
  },
};

const figureLine = {
  hidden: { opacity: 0, y: punch.distance },
  show: {
    opacity: 1,
    y: 0,
    transition: riseEase,
  },
};

export function GeneList({
  genes,
}: {
  genes: readonly { name: string; body: string; tag?: string }[];
}) {
  const play = usePlay();
  const items = genes.map((gene) => (
    <li key={gene.name}>
      {gene.tag ? <p className={styles.geneTag}>{gene.tag}</p> : null}
      <p className={styles.geneName}>{gene.name}</p>
      <p>{gene.body}</p>
    </li>
  ));

  if (!play) {
    return <ul className={styles.genes}>{items}</ul>;
  }

  return (
    <motion.ul
      className={styles.genes}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger.tiles } },
      }}
    >
      {genes.map((gene) => (
        <motion.li key={gene.name} variants={line}>
          {gene.tag ? <p className={styles.geneTag}>{gene.tag}</p> : null}
          <p className={styles.geneName}>{gene.name}</p>
          <p>{gene.body}</p>
        </motion.li>
      ))}
    </motion.ul>
  );
}

export function PointList({ lines }: { lines: readonly string[] }) {
  const play = usePlay();

  if (!play) {
    return (
      <ul className={styles.points}>
        {lines.map((lineText) => (
          <li key={lineText}>{lineText}</li>
        ))}
      </ul>
    );
  }

  return (
    <motion.ul
      className={styles.points}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger.tiles } },
      }}
    >
      {lines.map((lineText) => (
        <motion.li key={lineText} variants={line}>
          {lineText}
        </motion.li>
      ))}
    </motion.ul>
  );
}

export function Callout() {
  const play = usePlay();
  const tickRef = useRef<HTMLSpanElement>(null);
  const tickInView = useInView(tickRef, { once: true, margin: viewport.margin });
  const rest = (
    <span className={styles.calloutRest}>
      The window to own it is <em>open now</em>, and it closes once larger players formalize it.
    </span>
  );

  if (!play) {
    return (
      <p className={styles.callout}>
        <span className={styles.calloutLead}>No major firm has claimed this category yet.</span>
        <span className={styles.tick} />
        {rest}
      </p>
    );
  }

  return (
    <p className={styles.callout}>
      <Rise as="span" className={styles.calloutLead} text="No major firm has claimed this category yet." />
      <span className={styles.tick} ref={tickRef}>
        <motion.span
          className={styles.tickBar}
          initial={false}
          animate={{ scaleX: tickInView ? 1 : 0 }}
          transition={riseEase}
        />
      </span>
      {rest}
    </p>
  );
}

export function Essay() {
  const play = usePlay();
  const copy = (
    <>
      <p>
        Bloom has run this model for six years, before it had a name. Our team of about 12 works
        embedded with enterprises and early-stage companies alike, at the line between design and
        engineering where AI products succeed or fail. The momentum behind this positioning is building
        in both markets.
      </p>
      <p>
        <strong>The market is already paying for it.</strong>
      </p>
      <p className={styles.figure}>+25%</p>
      <p className={styles.figureNote}>Revenue, year to date (Jan–Sep), up from +21% last year</p>
      <p className={styles.figure}>+48%</p>
      <p className={styles.figureNote}>Net income, year to date (Jan–Sep), after +45% last year</p>
      <p>
        <strong>Proven model, not a pivot.</strong> Embedded delivery is how we already work, so the
        positioning describes the business we run.
      </p>
      <p>
        <strong>Built for the AI moment.</strong> Our people use AI to ship faster, so each person
        delivers more as the tools improve.
      </p>
      <p>
        <strong>Category ownership.</strong> We are putting a name on the forward deployed design
        engineer, in public, before anyone else does.
      </p>
      <p>
        <strong>The value is in the relationship.</strong> Embedded teams become trusted partners, which
        turns projects into long-running engagements that compound.
      </p>
    </>
  );

  if (!play) {
    return <div className={`${styles.prose} ${styles.essay}`}>{copy}</div>;
  }

  return (
    <motion.div
      className={`${styles.prose} ${styles.essay}`}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger.section } },
      }}
    >
      <motion.p variants={line}>
        Bloom has run this model for six years, before it had a name. Our team of about 12 works
        embedded with enterprises and early-stage companies alike, at the line between design and
        engineering where AI products succeed or fail. The momentum behind this positioning is building
        in both markets.
      </motion.p>
      <motion.p variants={line}>
        <strong>The market is already paying for it.</strong>
      </motion.p>
      <motion.p className={styles.figure} variants={figureLine}>
        +25%
      </motion.p>
      <motion.p className={styles.figureNote} variants={line}>
        Revenue, year to date (Jan–Sep), up from +21% last year
      </motion.p>
      <motion.p className={styles.figure} variants={figureLine}>
        +48%
      </motion.p>
      <motion.p className={styles.figureNote} variants={line}>
        Net income, year to date (Jan–Sep), after +45% last year
      </motion.p>
      <motion.p variants={line}>
        <strong>Proven model, not a pivot.</strong> Embedded delivery is how we already work, so the
        positioning describes the business we run.
      </motion.p>
      <motion.p variants={line}>
        <strong>Built for the AI moment.</strong> Our people use AI to ship faster, so each person
        delivers more as the tools improve.
      </motion.p>
      <motion.p variants={line}>
        <strong>Category ownership.</strong> We are putting a name on the forward deployed design
        engineer, in public, before anyone else does.
      </motion.p>
      <motion.p variants={line}>
        <strong>The value is in the relationship.</strong> Embedded teams become trusted partners, which
        turns projects into long-running engagements that compound.
      </motion.p>
    </motion.div>
  );
}
