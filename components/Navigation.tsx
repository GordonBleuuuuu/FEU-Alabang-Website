"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Logo from "./Logo";

const navigation = [
  { label: "Home", href: "#home" },
  { label: "Events", href: "#events" },
  { label: "About", href: "#about" },
  { label: "Leadership", href: "#leadership" },
  { label: "Initiatives", href: "#initiatives" },
] as const;

export default function Navigation() {
  const [activeHref, setActiveHref] = useState("#home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navigation
      .map(({ href }) => document.querySelector<HTMLElement>(href))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: "-30% 0px -55%", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header
      className={`sticky inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        hasScrolled
          ? "border-white/15 bg-feu-moss/90 shadow-glass backdrop-blur-2xl"
          : "border-white/10 bg-feu-moss/75 backdrop-blur-xl"
      }`}
    >
      <nav
        aria-label="Primary navigation"
        className="container-px flex h-[4.75rem] items-center justify-between"
      >
        <a href="#home" className="group flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 transition group-hover:ring-gold-default/70">
            <Logo className="h-9 w-9" priority />
          </span>
          <span className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-gold-default">
              FEU Alabang
            </span>
            <span className="truncate text-sm font-bold text-white">
              Student Coordinating Council
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? "location" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-default ${
                  isActive
                    ? "bg-gold-default text-feu-moss"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <a
          href="/admin"
          className="hidden items-center gap-2 rounded-full border border-gold-default/50 bg-gold-default/10 px-4 py-2 text-sm font-bold text-gold-default transition hover:bg-gold-default hover:text-feu-moss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-default lg:inline-flex"
        >
          Executive Portal
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-default lg:hidden"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        id="mobile-navigation"
        className={`overflow-hidden border-white/10 bg-feu-moss/95 backdrop-blur-2xl transition-[max-height,border-width] duration-300 lg:hidden ${
          isMenuOpen ? "max-h-[28rem] border-t" : "max-h-0 border-t-0"
        }`}
      >
        <div className="container-px flex flex-col gap-1 py-4">
          {navigation.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? "location" : undefined}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-gold-default text-feu-moss"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            );
          })}
          <a
            href="/admin"
            onClick={() => setIsMenuOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-default px-4 py-3 text-sm font-bold text-feu-moss"
          >
            Executive Portal
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
