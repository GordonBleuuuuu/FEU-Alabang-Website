"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";

// Each stat has a target integer (`to`) and any non-numeric decoration that
// should render alongside the animated number — a `+` suffix on "13+", etc.
const STATS = [
  { to: 2021, label: "Established", suffix: "", format: "year" },
  { to: 6, label: "Leadership Batches", suffix: "", format: "int" },
  { to: 13, label: "Annual Programs", suffix: "+", format: "int" },
];

export default function HeroStats() {
  const containerRef = useRef(null);
  const [values, setValues] = useState(STATS.map(() => 0));
  const startedRef = useRef(false);

  // Trigger the count-up when the stats scroll into view — feels natural on
  // desktop too because the hero mounts already visible.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      // Respect users who prefer reduced motion — snap to final values.
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        setValues(STATS.map((s) => s.to));
        return;
      }

      // Animate each counter independently. The `year` stat starts from a
      // sensible baseline (2000) rather than 0 so it doesn't visually tick
      // through millennia — feels faster + cleaner.
      STATS.forEach((s, i) => {
        const from = s.format === "year" ? 2000 : 0;
        const holder = { n: from };
        setValues((prev) => {
          const next = [...prev];
          next[i] = from;
          return next;
        });
        anime({
          targets: holder,
          n: s.to,
          round: 1,
          duration: 1600 + i * 150,
          delay: i * 100,
          easing: "easeOutExpo",
          update: () => {
            setValues((prev) => {
              const next = [...prev];
              next[i] = holder.n;
              return next;
            });
          },
        });
      });
    };

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && start()),
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <dl
      ref={containerRef}
      className="mt-12 grid max-w-lg grid-cols-3 gap-4"
    >
      {STATS.map((s, i) => (
        <div
          key={s.label}
          className="glass rounded-2xl px-4 py-4 text-center"
        >
          <dt className="text-2xl font-black tabular-nums text-gold sm:text-3xl">
            {values[i]}
            {s.suffix}
          </dt>
          <dd className="mt-1 text-[0.7rem] font-medium uppercase tracking-wide text-white/70">
            {s.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}
