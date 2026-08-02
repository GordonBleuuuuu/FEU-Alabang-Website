"use client";

import { useEffect, useState } from "react";

// Hero background photos. Drop image files into /public/hero/ using these
// names (add or remove entries to match how many photos you have). Missing
// files are skipped gracefully — the green background shows through.
const SLIDES = [
  "/hero/scc-1.jpg",
  "/hero/scc-2.jpg",
  "/hero/scc-3.jpg",
];

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState({});

  // Only cycle through images that actually loaded.
  const valid = SLIDES.map((_, i) => i).filter((i) => !failed[i]);
  const activeIdx = valid.length ? valid[index % valid.length] : -1;

  useEffect(() => {
    if (valid.length <= 1) return;
    const id = setInterval(() => setIndex((i) => i + 1), 5500);
    return () => clearInterval(id);
  }, [valid.length]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {SLIDES.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
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
