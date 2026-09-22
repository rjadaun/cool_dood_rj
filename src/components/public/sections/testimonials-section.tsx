"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import type { Media, Testimonial } from "@prisma/client";
import { MediaImage } from "@/components/shared/media-image";

type Item = Testimonial & { image: Media | null };

export function TestimonialsSection({ testimonials }: { testimonials: Item[] }) {
  const [index, setIndex] = React.useState(0);
  const count = testimonials.length;

  React.useEffect(() => {
    if (count <= 1) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearTimeout(t);
  }, [index, count]);

  if (count === 0) return null;
  const item = testimonials[index]!;
  const go = (n: number) => setIndex(((n % count) + count) % count);

  return (
    <section className="bg-ink text-paper">
      <div className="container-editorial py-24 md:py-32">
        <p className="label mb-12 text-paper/50">Testimonials</p>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {item.rating ? (
                  <div className="mb-6 flex gap-1">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent-soft text-accent-soft" />
                    ))}
                  </div>
                ) : null}
                <p className="font-serif text-3xl font-light leading-[1.3] text-paper md:text-4xl">
                  “{item.quote}”
                </p>
                <footer className="mt-8 flex items-center gap-4">
                  {item.image && (
                    <div className="relative h-12 w-12 overflow-hidden rounded-full">
                      <MediaImage media={item.image} alt={item.name} sizes="48px" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-paper">{item.name}</div>
                    <div className="text-xs text-paper/60">
                      {[item.role, item.company].filter(Boolean).join(", ")}
                    </div>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {count > 1 && (
            <div className="flex items-end justify-between md:col-span-4 md:flex-col md:items-end md:justify-end md:gap-6">
              <span className="font-mono text-sm text-paper/50">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => go(index - 1)}
                  aria-label="Previous testimonial"
                  className="flex h-11 w-11 items-center justify-center border border-white/25 transition-colors hover:border-white hover:bg-white/5"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => go(index + 1)}
                  aria-label="Next testimonial"
                  className="flex h-11 w-11 items-center justify-center border border-white/25 transition-colors hover:border-white hover:bg-white/5"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
