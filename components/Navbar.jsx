"use client";

import { useEffect, useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Leadership", href: "#leadership" },
  { label: "Activities", href: "#activities" },
  { label: "Initiatives", href: "#initiatives" },
  { label: "Apply", href: "#apply", highlight: true },
  { label: "Resources", href: "#resources" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = NAV_LINKS.map((link) => link.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-feu-moss/85 backdrop-blur-xl shadow-glass"
          : "bg-transparent"
      }`}
    >
      <nav className="container-px flex h-[4.75rem] items-center justify-between">
        <a href="#home" className="group flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 transition group-hover:ring-gold/60">
            <Logo className="h-9 w-9" priority />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold">
              FEU Alabang
            </span>
            <span className="text-sm font-bold text-white sm:text-base">
              Student Coordinating Council
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.href;

            if (link.highlight) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`group relative ml-1 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
                    isActive
                      ? "bg-gold text-feu-moss shadow-gold"
                      : "bg-gold/15 text-gold ring-1 ring-gold/50 hover:bg-gold hover:text-feu-moss"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full bg-gold ${
                      isActive ? "" : "animate-pulse ring-2 ring-gold/40"
                    }`}
                    aria-hidden="true"
                  />
                  {link.label}
                </a>
              );
            }

            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? "text-feu-moss" : "text-white/80 hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-gold" />
                )}
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="hidden lg:block">
          <a href="#resources" className="btn-gold px-5 py-2.5 text-sm">
            Contact SCC
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={`overflow-hidden border-t border-white/10 bg-feu-moss/95 backdrop-blur-xl transition-[max-height] duration-300 lg:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="container-px flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={
                link.highlight
                  ? "flex items-center justify-between rounded-xl bg-gold/15 px-4 py-3 text-sm font-bold text-gold ring-1 ring-gold/50 transition hover:bg-gold hover:text-feu-moss"
                  : "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
              }
            >
              <span className="inline-flex items-center gap-2">
                {link.highlight && (
                  <span
                    className="h-2 w-2 animate-pulse rounded-full bg-gold ring-2 ring-gold/40"
                    aria-hidden="true"
                  />
                )}
                {link.label}
              </span>
              <ChevronRight className="h-4 w-4 text-gold" />
            </a>
          ))}
          <a
            href="#resources"
            onClick={() => setOpen(false)}
            className="btn-gold mt-2 w-full"
          >
            Contact SCC
          </a>
        </div>
      </div>
    </header>
  );
}
