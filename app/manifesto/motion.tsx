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

const sign = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: chromeSnap.duration, ease: chromeSnap.ease },
  },
};

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
        Bloom has run this model for six years, before it had a name. There are about twelve of us. We
        sit inside the client&apos;s team, on the line between design and engineering. That is the line
        where an AI product either gets used or becomes another pilot that never ships.
      </p>
      <p>
        I am writing to the people who taught me that line. The designer who will not call a flow done
        until someone has actually walked it. The engineer who stays in the critique because the
        interface is their work too. The operator who knows the Tuesday morning the software has to
        survive. AI can draft the screens. It cannot care whether they land. That care is still the
        craft, and I want the next decade of this industry to belong to the people who still practice
        it.
      </p>
      <p>The market is already paying for that care.</p>
      <p className={styles.figure}>+25%</p>
      <p className={styles.figureNote}>Revenue, year to date (Jan–Sep), up from +21% last year</p>
      <p className={styles.figure}>+48%</p>
      <p className={styles.figureNote}>Net income, year to date (Jan–Sep), after +45% last year</p>
      <p>
        This is a proven model, not a pivot. Embedded delivery is how we already work, so the name
        describes the business we run. Our people use AI to ship faster, and each person delivers more
        as the tools improve. We are putting a name on the forward deployed design engineer, in public,
        before anyone else does. And the relationship does not reset when the project ends. It
        compounds. Trust turns a brief into a long role, and a long role into the team they call when
        the next hard thing shows up.
      </p>
      <p>
        An owner of Bloom gets an operating studio and a head start on a category that is still open.
        The next step is the one I most want: more forward deployed teams, placed with more enterprises
        that are trying to make AI work, staffed by people who love the making.
      </p>
      <p>
        The agencies that keep selling hours will shrink. The studios that sell adoption will set the
        price. Bloom is built to be one of them. I hope the industry I love is the one that gets there
        first.
      </p>
      <p className={styles.signoff}>James</p>
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
        Bloom has run this model for six years, before it had a name. There are about twelve of us. We
        sit inside the client&apos;s team, on the line between design and engineering. That is the line
        where an AI product either gets used or becomes another pilot that never ships.
      </motion.p>
      <motion.p variants={line}>
        I am writing to the people who taught me that line. The designer who will not call a flow done
        until someone has actually walked it. The engineer who stays in the critique because the
        interface is their work too. The operator who knows the Tuesday morning the software has to
        survive. AI can draft the screens. It cannot care whether they land. That care is still the
        craft, and I want the next decade of this industry to belong to the people who still practice
        it.
      </motion.p>
      <motion.p variants={line}>The market is already paying for that care.</motion.p>
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
        This is a proven model, not a pivot. Embedded delivery is how we already work, so the name
        describes the business we run. Our people use AI to ship faster, and each person delivers more
        as the tools improve. We are putting a name on the forward deployed design engineer, in public,
        before anyone else does. And the relationship does not reset when the project ends. It
        compounds. Trust turns a brief into a long role, and a long role into the team they call when
        the next hard thing shows up.
      </motion.p>
      <motion.p variants={line}>
        An owner of Bloom gets an operating studio and a head start on a category that is still open.
        The next step is the one I most want: more forward deployed teams, placed with more enterprises
        that are trying to make AI work, staffed by people who love the making.
      </motion.p>
      <motion.p variants={line}>
        The agencies that keep selling hours will shrink. The studios that sell adoption will set the
        price. Bloom is built to be one of them. I hope the industry I love is the one that gets there
        first.
      </motion.p>
      <motion.p className={styles.signoff} variants={sign}>
        James
      </motion.p>
    </motion.div>
  );
}
