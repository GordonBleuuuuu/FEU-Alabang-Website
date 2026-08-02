"use client";

import { useEffect, useState } from "react";

// Hero background photos. Drop image files into /public/hero/ using these
// names. Missing files are skipped gracefully — the green background shows
// through. Images load progressively (see loadSet below) so 17 photos don't
// all download at once.
const SLIDES = [
  "/hero/scc-1.jpg",
  "/hero/scc-2.jpg",
  "/hero/scc-3.jpg",
  "/hero/scc-4.jpg",
  "/hero/scc-5.jpg",
  "/hero/scc-6.jpg",
  "/hero/scc-7.jpg",
  "/hero/scc-8.jpg",
  "/hero/scc-9.jpg",
  "/hero/scc-10.jpg",
  "/hero/scc-11.jpg",
  "/hero/scc-12.jpg",
  "/hero/scc-13.jpg",
  "/hero/scc-14.jpg",
  "/hero/scc-15.jpg",
  "/hero/scc-16.jpg",
  "/hero/scc-17.jpg",
];

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState({});
  // Only these slide indexes have their `src` set (so images load on demand,
  // not all at once). Starts with the first + next slide.
  const [loadSet, setLoadSet] = useState(() => new Set([0, 1]));

  const valid = SLIDES.map((_, i) => i).filter((i) => !failed[i]);
  const activeIdx = valid.length ? valid[index % valid.length] : -1;

  // Advance the slideshow.
  useEffect(() => {
    if (valid.length <= 1) return;
    const id = setInterval(() => setIndex((i) => i + 1), 5500);
    return () => clearInterval(id);
  }, [valid.length]);

  // Make sure the current + upcoming slide have their sources loaded.
  useEffect(() => {
    if (activeIdx < 0 || valid.length === 0) return;
    const nextIdx = valid[(index + 1) % valid.length];
    setLoadSet((prev) => {
      if (prev.has(activeIdx) && prev.has(nextIdx)) return prev;
      const s = new Set(prev);
      s.add(activeIdx);
      s.add(nextIdx);
      return s;
    });
  }, [index, activeIdx, valid.length]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {SLIDES.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={loadSet.has(i) ? src : undefined}
          alt=""
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          onError={() =>
            setFailed((f) => (f[i] ? f : { ...f, [i]: true }))
          }
          className={`absolute inset-0 h-full w-full scale-105 object-cover transition-opacity duration-[1200ms] ease-in-out ${
            i === activeIdx ? "opacity-100" : "opacity-0"
          }`}
          style={{ filter: "grayscale(0.15) brightness(0.85)" }}
        />
      ))}
    </div>
  );
}
