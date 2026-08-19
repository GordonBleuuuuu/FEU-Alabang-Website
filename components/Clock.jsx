"use client";

import { useEffect, useRef, useState } from "react";
import { createTimeline, stagger } from "animejs";

// Get the current time in the Philippines regardless of the viewer's own timezone.
// Uses Intl so DST/offset math stays correct without hardcoding hours.
function getManilaNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type) => {
    const v = parts.find((p) => p.type === type)?.value ?? "0";
    return parseInt(v, 10);
  };
  return {
    h: get("hour") % 24,
    m: get("minute"),
    s: get("second"),
    ms: new Date().getMilliseconds(),
  };
}

const pad = (n) => String(n).padStart(2, "0");

export default function Clock() {
  const rootRef = useRef(null);
  const [time, setTime] = useState(() => getManilaNow());

  useEffect(() => {
    const scope = rootRef.current;
    if (!scope) return;

    // Initial ripple: each tick springs into place around the ring.
    const ticks = scope.querySelectorAll(".tick");
    const timeline = createTimeline({ loop: false }).add(
      ticks,
      {
        scale: [1.35, 1],
        opacity: [0.25, 1],
        duration: 520,
        ease: "outElastic(1, 0.55)",
      },
      stagger(10)
    );

    // Smooth continuous updates for the second hand sweep — feels premium.
    // Respects prefers-reduced-motion by falling back to 1Hz ticking.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rafId;
    let intervalId;
    if (reduce) {
      const tick = () => setTime(getManilaNow());
      tick();
      intervalId = setInterval(tick, 1000);
    } else {
      const loop = () => {
        setTime(getManilaNow());
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      if (timeline && typeof timeline.pause === "function") timeline.pause();
      if (rafId) cancelAnimationFrame(rafId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Compute hand angles (0° = 12 o'clock, clockwise). Minute and hour hands
  // move smoothly with sub-unit progress so they don't visibly "jump."
  const smoothSec = time.s + time.ms / 1000;
  const smoothMin = time.m + smoothSec / 60;
  const smoothHour = (time.h % 12) + smoothMin / 60;
  const secAngle = (smoothSec / 60) * 360;
  const minAngle = (smoothMin / 60) * 360;
  const hourAngle = (smoothHour / 12) * 360;

  const digital = `${pad(time.h)}:${pad(time.m)}:${pad(time.s)}`;

  // 60 tick marks — every 5th one longer/bolder as an hour mark.
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

  // Hand renderer — outer div rotates, inner rectangle extends upward from center.
  const Hand = ({ angle, length, width, gradient, glow }) => (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ transform: `rotate(${angle}deg)` }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width,
          height: length,
          transform: "translateX(-50%) translateY(-100%)",
          background: gradient,
          borderRadius: 999,
          filter: glow ? `drop-shadow(0 0 6px ${glow})` : undefined,
        }}
      />
    </div>
  );

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

        {/* Tick marks */}
        {ticks}

        {/* Hour hand — short, chunky, deep gold */}
        <Hand
          angle={hourAngle}
          length={54}
          width={5}
          gradient="linear-gradient(to top, #B8860B, #FFB703)"
          glow="rgba(255,183,3,0.35)"
        />
        {/* Minute hand — medium length, bold gold */}
        <Hand
          angle={minAngle}
          length={76}
          width={3.5}
          gradient="linear-gradient(to top, #D4AF37, #FFD166)"
          glow="rgba(255,183,3,0.45)"
        />
        {/* Second hand — thin, bright, with slight tail behind pivot */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ transform: `rotate(${secAngle}deg)` }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 2,
              height: 92,
              transform: "translateX(-50%) translateY(-90%)",
              background:
                "linear-gradient(to top, transparent 10%, #FFD166 20%, #FFF7CC 100%)",
              borderRadius: 999,
              filter: "drop-shadow(0 0 6px rgba(255,209,102,0.55))",
            }}
          />
        </div>

        {/* Center emblem — sits on top of all hands to hide the pivot */}
        <div
          className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-feu-moss shadow-glass"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #FFF7CC 0%, #FFB703 55%, #D4AF37 100%)",
          }}
        >
          <div className="text-[0.55rem] font-black tracking-[0.2em]">SCC</div>
        </div>
      </div>

      {/* Caption + live digital time (Manila) */}
      <div className="text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-feu-green">
          Manila ·{" "}
          <span className="font-mono tabular-nums text-feu-teal">
            {digital}
          </span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Empowered · United · Brave
        </p>
      </div>
    </div>
  );
}
