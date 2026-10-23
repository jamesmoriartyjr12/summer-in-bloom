"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { enter } from "@/lib/motion";

type Tag = "div" | "header" | "section";

export function LetterBlock({
  as = "div",
  className,
  children,
}: {
  as?: Tag;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const play = ready && reduce === false;

  if (!play) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: enter.distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: enter.duration, ease: enter.ease }}
    >
      {children}
    </MotionTag>
  );
}
