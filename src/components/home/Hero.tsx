"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CalendarDays, ChevronDown, Star } from "lucide-react";
import { IMG } from "@/lib/images";

export function Hero({ tagline }: { tagline: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const line = (delay: number) => ({
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, delay, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] },
  });

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden bg-espresso text-cream">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.heroLatte} alt="Latte art cappuccino on a marble table" className="h-full w-full object-cover" fetchPriority="high" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-espresso/90 via-espresso/60 to-espresso/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-espresso/40" />

      <motion.div style={{ opacity: fade }} className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-36">
        <motion.div {...line(0.2)} className="inline-flex items-center gap-2 rounded-full glass-dark px-4 py-2 text-xs tracking-[0.2em] uppercase text-gold-light">
          <Star size={12} fill="currentColor" /> Specialty coffee · Fine pastry
        </motion.div>

        <h1 className="mt-8 max-w-4xl text-[3.4rem] font-medium leading-[0.95] sm:text-7xl md:text-[6.5rem]">
          <motion.span {...line(0.35)} className="block">
            Where every cup
          </motion.span>
          <motion.span {...line(0.5)} className="block italic text-gold-light">
            becomes a ritual.
          </motion.span>
        </h1>

        <motion.p {...line(0.75)} className="mt-8 max-w-xl text-lg leading-relaxed text-cream/80">
          {tagline}. Single-origin beans roasted with care, pastries baked at dawn, and a room made for lingering.
        </motion.p>

        <motion.div {...line(0.95)} className="mt-10 flex flex-wrap gap-4">
          <Link href="/menu" className="btn btn-gold">
            Explore Menu <ArrowRight size={16} />
          </Link>
          <Link href="/reservations" className="btn btn-ghost text-cream">
            <CalendarDays size={16} /> Book a Table
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.9 }}
        className="absolute bottom-10 right-6 hidden w-64 rounded-3xl glass-dark p-5 lg:block xl:right-16"
      >
        <p className="eyebrow !text-gold-light">Today&apos;s pour</p>
        <p className="mt-2 font-display text-2xl">Ethiopian Yirgacheffe</p>
        <p className="mt-1 text-sm text-cream/65">Jasmine, bergamot &amp; honey. Brewed as V60 or espresso.</p>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-cream/70"
        aria-hidden
      >
        <ChevronDown />
      </motion.div>
    </section>
  );
}
