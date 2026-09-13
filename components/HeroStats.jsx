"use client";

import { useEffect, useRef, useState } from "react";

// Each stat has a target integer (`to`) and any non-numeric decoration that
// should render alongside the animated number — a `+` suffix on "13+", etc.
const STATS = [
  { to: 2021, from: 2000, label: "Established", suffix: "" },
  { to: 6, from: 0, label: "Leadership Batches", suffix: "" },
  { to: 13, from: 0, label: "Annual Programs", suffix: "+" },
];

// easeOutExpo — fast burst, gentle settle, matches the animation's original feel.
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function HeroStats() {
  const containerRef = useRef(null);
  const [values, setValues] = useState(STATS.map((s) => s.from));
  const startedRef = useRef(false);
  const rafsRef = useRef([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const scheduledRafs = rafsRef.current;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      // Respect users who prefer reduced motion — snap to final values.
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      if (reduce) {
        setValues(STATS.map((s) => s.to));
        return;
      }

      // Fire each counter as its own rAF loop, with a small stagger.
      STATS.forEach((s, i) => {
        const duration = 1600 + i * 150;
        const delay = i * 100;
        const startAt = performance.now() + delay;

        const tick = (now) => {
          const elapsed = now - startAt;
          if (elapsed < 0) {
            scheduledRafs[i] = requestAnimationFrame(tick);
            return;
          }
          const t = Math.min(1, elapsed / duration);
          const eased = easeOutExpo(t);
          const value = Math.round(s.from + (s.to - s.from) * eased);
          setValues((prev) => {
            if (prev[i] === value) return prev; // avoid needless re-renders
            const next = [...prev];
            next[i] = value;
            return next;
          });
          if (t < 1) scheduledRafs[i] = requestAnimationFrame(tick);
        };
        scheduledRafs[i] = requestAnimationFrame(tick);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && start()),
      { threshold: 0.4 }
    );
    observer.observe(el);

    // Also kick off after a short delay in case the section is already in view
    // on mount (hero is above the fold, IntersectionObserver may already have
    // fired by mount time on some browsers).
    const kick = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const visible =
        rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
      if (visible) start();
    }, 200);

    return () => {
      observer.disconnect();
      clearTimeout(kick);
      scheduledRafs.forEach((id) => id && cancelAnimationFrame(id));
    };
  }, []);

  return (
    <dl ref={containerRef} className="mt-12 grid max-w-lg grid-cols-3 gap-4">
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
