"use client";

import { motion } from "framer-motion";

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const M = motion[as];
  return (
    <M
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
    >
      {children}
    </M>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  light = false,
  center = true,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text?: string;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow" style={light ? { color: "var(--color-gold-light)" } : undefined}>
        {eyebrow}
      </p>
      <h2 className={`mt-3 text-4xl leading-[1.05] sm:text-5xl md:text-6xl ${light ? "text-cream" : "text-espresso"}`}>
        {title}
      </h2>
      {text && <p className={`mt-5 text-base leading-relaxed ${light ? "text-cream/70" : "text-mocha/75"}`}>{text}</p>}
    </Reveal>
  );
}
