"use client";

import { useState } from "react";
import Crest from "./Crest";

// Renders the official SCC crest from /public/scc-logo.png.
// If the image is missing (e.g. before you drop the file in), it gracefully
// falls back to the built-in SVG crest so the UI never shows a broken image.
export default function Logo({ className = "h-10 w-10", priority = false }) {
  const [failed, setFailed] = useState(false);

  if (failed) return <Crest className={className} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/scc-logo.png"
      alt="FEU Alabang Student Coordinating Council crest"
      className={`${className} object-contain`}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}
