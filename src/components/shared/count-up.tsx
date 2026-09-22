"use client";

import * as React from "react";
import { useInView, useReducedMotion, animate } from "framer-motion";

/**
 * Animates the numeric part of a stat (e.g. "120+", "06+") counting up from 0
 * the first time it scrolls into view. Preserves any prefix/suffix and the
 * original digit padding ("06+" counts 0 → 6 and stays zero-padded).
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  const match = value.match(/(\d+)/);
  const digits = match?.[1];
  const [display, setDisplay] = React.useState(reduce || !digits ? value : value.replace(/\d+/, "0".padStart(digits!.length, "0")));

  React.useEffect(() => {
    if (!inView || !digits || reduce) {
      if (reduce) setDisplay(value);
      return;
    }
    const target = parseInt(digits, 10);
    const pad = digits.length;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        const n = Math.round(v).toString().padStart(pad, "0");
        setDisplay(value.replace(/\d+/, n));
      },
    });
    return () => controls.stop();
  }, [inView, digits, value, reduce]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
