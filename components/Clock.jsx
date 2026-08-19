"use client";

import { useEffect, useRef } from "react";
import { createTimeline, stagger } from "animejs";

// SCC-branded aesthetic clock. Green base, gold tick ring, rotating gold pointer.
// Uses anime.js v4 createTimeline() with stagger() as specified.
export default function Clock() {
  const rootRef = useRef(null);

  useEffect(() => {
    const scope = rootRef.current;
    if (!scope) return;

    const ticks = scope.querySelectorAll(".tick");
    const ticker = scope.querySelector(".ticker");

    // Timeline that plays forever:
    //  - Wave: each tick pops up 6px in sequence (10ms stagger)
    //  - Ticker: sweeps a full rotation in parallel (~1.92s / cycle)
    const timeline = createTimeline({ loop: true })
      .add(
        ticks,
        {
          translateY: [-6, 0],
          opacity: [0.5, 1],
          scale: [1.15, 1],
          duration: 320,
          ease: "inOutSine",
        },
        stagger(10)
      )
      .add(
        ticker,
        {
          rotate: 360,
          duration: 1920,
          ease: "linear",
        },
        "<"
      );

    return () => {
      if (timeline && typeof timeline.pause === "function") timeline.pause();
    };
  }, []);

  // 60 ticks evenly around the ring, hour-marks (every 5th) longer/bolder.
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i / 60) * 360;
    const isHour = i % 5 === 0;
    return (
      <div
        key={i}
        className="absolute left-1/2 top-1/2"
        style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
      >
        <div
          className="tick"
          style={{
            transform: `translateY(-94px)`,
            width: isHour ? 3 : 1.5,
            height: isHour ? 14 : 6,
            background: isHour
              ? "linear-gradient(180deg, #FFD166 0%, #FFB703 100%)"
              : "rgba(255, 183, 3, 0.5)",
            borderRadius: 999,
            boxShadow: isHour ? "0 0 6px rgba(255,183,3,0.4)" : "none",
          }}
        />
      </div>
    );
  });

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Clock face */}
      <div
        ref={rootRef}
        className="relative h-56 w-56 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, #0F5257 0%, #004B23 55%, #0A3D1F 100%)",
          boxShadow:
            "0 30px 70px -20px rgba(0, 75, 35, 0.55), inset 0 0 40px rgba(255, 183, 3, 0.06)",
        }}
      >
        {/* Outer gold ring */}
        <div
          className="pointer-events-none absolute inset-1 rounded-full"
          style={{ border: "1px solid rgba(255, 183, 3, 0.35)" }}
        />
        {/* Inner subtle ring */}
        <div className="pointer-events-none absolute inset-8 rounded-full border border-white/5" />

        {/* Ticks */}
        {ticks}

        {/* Rotating pointer (sweeping gold gradient) */}
        <div
          className="ticker pointer-events-none absolute inset-0"
          style={{ transformOrigin: "center" }}
        >
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2"
            style={{
              width: 3,
              height: "40%",
              transform: "translateX(-50%) translateY(-100%)",
              background:
                "linear-gradient(to top, transparent 0%, #FFB703 25%, #FFD166 100%)",
              borderRadius: 999,
              filter: "drop-shadow(0 0 8px rgba(255, 183, 3, 0.5))",
            }}
          />
        </div>

        {/* Center emblem */}
        <div
          className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-feu-moss shadow-glass"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #FFD166 0%, #FFB703 60%, #D4AF37 100%)",
          }}
        >
          <div className="text-[0.55rem] font-black tracking-[0.2em]">SCC</div>
        </div>
      </div>

      {/* Caption — colors work on both light and dark backgrounds */}
      <div className="text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-feu-green">
          FEU Alabang · Est. 2021
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Empowered · United · Brave
        </p>
      </div>
    </div>
  );
}
