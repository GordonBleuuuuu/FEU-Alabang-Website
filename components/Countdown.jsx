"use client";

import { useEffect, useState } from "react";

// Live countdown to a target ISO date. Updates every second on the client.
// Shows days · hours · minutes · seconds in a tidy grid. Once the target
// passes it displays the `passedLabel` (default: "Now open!").
export default function Countdown({ targetIso, passedLabel = "Now open!" }) {
  const target = new Date(targetIso).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Kick once immediately so the SSR->CSR handoff shows the live value.
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = target - now;
  const passed = diff <= 0;

  if (passed) {
    return (
      <div className="inline-flex items-center gap-2 rounded-2xl bg-gold px-5 py-3 text-sm font-black text-feu-moss shadow-gold">
        {passedLabel}
      </div>
    );
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  const Unit = ({ value, label }) => (
    <div className="min-w-[64px] rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm ring-1 ring-white/15">
      <div className="text-2xl font-black tabular-nums text-gold sm:text-3xl">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white/70">
        {label}
      </div>
    </div>
  );

  return (
    <div className="inline-flex items-center gap-2">
      <Unit value={d} label="Days" />
      <span className="text-2xl font-black text-white/40">:</span>
      <Unit value={h} label="Hrs" />
      <span className="text-2xl font-black text-white/40">:</span>
      <Unit value={m} label="Mins" />
      <span className="text-2xl font-black text-white/40">:</span>
      <Unit value={s} label="Secs" />
    </div>
  );
}
