"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { HeroSlide, Media } from "@prisma/client";
import { HeroPicture } from "./hero-picture";
import { enquiryLabel } from "@/lib/enquiry";

type Slide = HeroSlide & { image: Media | null; mobileImage?: Media | null };

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  const sectionRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const count = slides.length;
  const active = slides[index];
  const duration = active?.durationMs ?? 6000;

  const go = React.useCallback(
    (next: number) => { if (count) setIndex(((next % count) + count) % count); },
    [count]
  );

  // Auto-advance.
  React.useEffect(() => {
    if (count <= 1 || paused || reduce) return;
    const t = setTimeout(() => go(index + 1), duration);
    return () => clearTimeout(t);
  }, [index, count, paused, duration, go, reduce]);

  if (count === 0 || !active) {
    return (
      <section className="flex h-[80vh] items-center justify-center bg-ink text-paper">
        <Link href="/portfolio" className="font-serif text-display-sm">Explore the portfolio</Link>
      </section>
    );
  }

  const kenBurns = active.transition === "KEN_BURNS" || active.transition === "SLOW_ZOOM";

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured work"
    >
      {/* Image layers */}
      <AnimatePresence mode="sync">
        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <motion.div
            className="hero-image-motion absolute inset-0"
            initial={kenBurns && !reduce ? { scale: 1.04 } : false}
            animate={kenBurns && !reduce ? { scale: 1.16 } : {}}
            transition={{ duration: (duration + 1500) / 1000, ease: "linear" }}
          >
            <HeroPicture
              image={active.image}
              mobileImage={active.mobileImage}
              title={active.title}
              priority={index === 0}
              focal={active.focal}
              mobileFocal={active.mobileFocal}
            />
          </motion.div>
          {/* Overlay: dark gradient bottom + flat tint from slide.overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(11,11,12,${active.overlay / 100})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/30" />
        </motion.div>
      </AnimatePresence>

      {/* Text content */}
      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="container-editorial relative z-10 flex h-full flex-col justify-end pb-24 md:justify-center md:pb-0"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id + "-text"}
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -10 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl text-paper"
          >
            {active.label && (
              <p className="mb-4 text-xs font-medium tracking-normal text-paper/80 md:mb-6">
                {active.label}
              </p>
            )}
            <h1 className="font-serif text-display-sm font-light leading-[1.02] md:text-display">
              {active.title}
            </h1>
            {active.description && (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-paper/80 md:mt-7 md:text-lg">
                {active.description}
              </p>
            )}
            {(active.ctaText || active.ctaSecondary) && (
              <div className="mt-8 flex flex-wrap items-center gap-4 md:mt-10">
                {active.ctaText && active.ctaUrl && (
                  <Link
                    href={active.ctaUrl}
                    className="group inline-flex min-h-12 items-center gap-2 bg-paper px-5 py-3 text-[13px] font-medium text-ink transition-colors hover:bg-white"
                  >
                    {enquiryLabel(active.ctaUrl, active.ctaText)}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
                {active.ctaSecondary && active.ctaSecondaryUrl && (
                  <Link
                    href={active.ctaSecondaryUrl}
                    className="group inline-flex min-h-12 items-center gap-2 border border-paper/40 px-5 py-3 text-[13px] font-medium text-paper transition-colors hover:border-paper hover:bg-paper/5"
                  >
                    {enquiryLabel(active.ctaSecondaryUrl, active.ctaSecondary)}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        style={reduce ? undefined : { opacity: contentOpacity }}
        className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-paper/60 md:bottom-10 md:flex"
      >
        <span className="text-[10px] uppercase tracking-label">Scroll</span>
        <span className="relative block h-8 w-px overflow-hidden bg-paper/20">
          <motion.span
            className="absolute inset-x-0 top-0 block h-3 bg-paper"
            animate={reduce ? undefined : { y: [-12, 32] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>

      {/* Controls */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-20 md:bottom-10">
          <div className="container-editorial flex items-center justify-between">
            {/* Indicators + progress */}
            <div className="flex items-center gap-3">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className="group relative h-8 py-3"
                >
                  <span className="block h-px w-10 bg-paper/30 md:w-14">
                    {i === index && (
                      <motion.span
                        key={active.id}
                        className="block h-full origin-left bg-paper"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: paused ? 0.001 : 1 }}
                        transition={{ duration: paused ? 0 : duration / 1000, ease: "linear" }}
                      />
                    )}
                  </span>
                </button>
              ))}
              <span className="ml-2 font-mono text-xs text-paper/60">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </div>

            {/* Arrows */}
            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => go(index - 1)}
                aria-label="Previous slide"
                className="flex h-11 w-11 items-center justify-center border border-paper/30 text-paper transition-colors hover:border-paper hover:bg-paper/5"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => go(index + 1)}
                aria-label="Next slide"
                className="flex h-11 w-11 items-center justify-center border border-paper/30 text-paper transition-colors hover:border-paper hover:bg-paper/5"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
