"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Star,
  ShieldCheck,
  ArrowRight,
  X,
  Quote,
  Lightbulb,
  Award,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { batches } from "@/data/leadership";

// Badge → color styling map.
const BADGE_STYLES = {
  Executive: "bg-feu-green/10 text-feu-green ring-feu-green/20",
  Secretariat: "bg-feu-teal/10 text-feu-teal ring-feu-teal/20",
  Finance: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
  Communications: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
  Operations: "bg-slate-500/10 text-slate-700 ring-slate-500/20",
};

// Deterministic avatar tone from a name so placeholders look varied.
const AVATAR_TONES = [
  "from-feu-green to-feu-teal",
  "from-gold to-gold-deep",
  "from-feu-teal to-feu-moss",
  "from-emerald-600 to-feu-green",
  "from-gold-deep to-feu-green",
];

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  email: Mail,
};

function SocialLinks({ officer, variant = "card" }) {
  const base =
    variant === "card"
      ? "bg-slate-100 text-slate-500 hover:bg-feu-green hover:text-white"
      : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-feu-green hover:text-white";
  return Object.entries(officer.socials || {}).map(([key, href]) => {
    const Icon = SOCIAL_ICONS[key];
    if (!Icon) return null;
    return (
      <a
        key={key}
        href={href}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        aria-label={`${officer.name} on ${key}`}
        className={`grid h-9 w-9 place-items-center rounded-xl transition ${base}`}
      >
        <Icon className="h-4 w-4" />
      </a>
    );
  });
}

function OfficerCard({ officer, index, onSelect }) {
  const tone = AVATAR_TONES[index % AVATAR_TONES.length];
  const badgeStyle = BADGE_STYLES[officer.badge] ?? BADGE_STYLES.Operations;
  // Show the officer's photo when provided; fall back to initials if it's
  // missing or fails to load, so the card never shows a broken image.
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = officer.photo && !photoFailed;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(officer)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(officer);
        }
      }}
      className="card-hover group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-feu-green focus-visible:ring-offset-2"
    >
      {/* Badge */}
      <span className={`pill absolute right-4 top-4 ring-1 ${badgeStyle}`}>
        {officer.badge}
      </span>

      {/* Avatar — photo if available, otherwise initials */}
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={officer.photo}
          alt={officer.name}
          onError={() => setPhotoFailed(true)}
          className="h-20 w-20 rounded-2xl object-cover shadow-glass ring-4 ring-white"
        />
      ) : (
        <div
          className={`grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-2xl font-black text-white shadow-glass ring-4 ring-white`}
        >
          {initials(officer.name)}
        </div>
      )}

      <h4 className="mt-5 text-lg font-bold text-ink">{officer.name}</h4>
      <p className="mt-1 text-sm font-semibold text-feu-teal">
        {officer.position}
      </p>
      {officer.department ? (
        <p className="mt-0.5 text-xs text-slate-500">{officer.department}</p>
      ) : null}

      {/* Socials + view-profile hint */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <SocialLinks officer={officer} variant="card" />
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-feu-green/70 transition group-hover:text-feu-green">
          View profile
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>

      <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-gold/10 blur-2xl transition group-hover:bg-gold/20" />
    </article>
  );
}

function OfficerProfileModal({ officer, batch, onClose }) {
  const [photoFailed, setPhotoFailed] = useState(false);

  // Escape to close + lock background scroll while open.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const showPhoto = officer.photo && !photoFailed;
  const hasBio = Boolean(officer.bio);
  const hasContribs = (officer.contributions || []).length > 0;
  const hasAchievements = (officer.achievements || []).length > 0;
  const hasSocials =
    officer.socials && Object.keys(officer.socials).length > 0;
  const isEmpty = !hasBio && !hasContribs && !hasAchievements;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="officer-profile-name"
    >
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[88vh] w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white text-ink shadow-2xl animate-fade-up">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-feu-green to-feu-teal p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4 pr-10">
            {showPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={officer.photo}
                alt={officer.name}
                onError={() => setPhotoFailed(true)}
                className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-4 ring-white/30"
              />
            ) : (
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-white/15 text-3xl font-black ring-4 ring-white/30">
                {initials(officer.name)}
              </div>
            )}
            <div>
              <span className="pill bg-white/15 text-gold ring-1 ring-white/20">
                {officer.badge}
              </span>
              <h3
                id="officer-profile-name"
                className="mt-2 text-xl font-black leading-tight"
              >
                {officer.name}
              </h3>
              <p className="text-sm font-semibold text-gold">
                {officer.position}
              </p>
              <p className="text-xs text-white/70">
                {batch.label} · {batch.sy}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[50vh] overflow-y-auto p-6">
          {officer.department ? (
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-ink">Program:</span>{" "}
              {officer.department}
            </p>
          ) : null}

          {hasBio && (
            <section className="mt-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-feu-green">
                <Quote className="h-4 w-4" /> About
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {officer.bio}
              </p>
            </section>
          )}

          {hasContribs && (
            <section className="mt-5">
              <h4 className="flex items-center gap-2 text-sm font-bold text-feu-green">
                <Lightbulb className="h-4 w-4" /> Contributions
              </h4>
              <ul className="mt-2 space-y-2">
                {officer.contributions.map((c, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-feu-teal" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasAchievements && (
            <section className="mt-5">
              <h4 className="flex items-center gap-2 text-sm font-bold text-feu-green">
                <Award className="h-4 w-4" /> Achievements &amp; Awards
              </h4>
              <ul className="mt-2 space-y-2">
                {officer.achievements.map((a, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600">
                    <Star className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isEmpty && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-cloud p-6 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-gold-deep" />
              <p className="mt-2 text-sm text-slate-500">
                More about {officer.name.split(" ")[0]} coming soon.
              </p>
            </div>
          )}
        </div>

        {/* Footer socials */}
        {hasSocials && (
          <div className="flex items-center gap-2 border-t border-slate-100 bg-cloud px-6 py-4">
            <span className="text-xs font-semibold text-slate-500">
              Connect:
            </span>
            <SocialLinks officer={officer} variant="modal" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Leadership() {
  const [activeId, setActiveId] = useState(
    batches.find((b) => b.active)?.id ?? batches[0].id
  );
  const [selected, setSelected] = useState(null); // { officer, batch }

  const activeBatch = useMemo(
    () => batches.find((b) => b.id === activeId) ?? batches[0],
    [activeId]
  );

  return (
    <section id="leadership" className="relative bg-white py-24">
      {/* Soft top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cloud to-transparent" />

      <div className="container-px relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">
            <ShieldCheck className="h-3.5 w-3.5" />
            Leadership
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Meet the councils behind the mission
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Six batches of elected student leaders, each carrying the torch of
            service forward. Switch between cohorts, then tap any officer to see
            their profile.
          </p>
        </div>

        {/* Batch switcher */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {batches.map((batch) => {
            const isActive = batch.id === activeId;
            return (
              <button
                key={batch.id}
                type="button"
                onClick={() => setActiveId(batch.id)}
                className={`group relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-feu-green text-white shadow-glass"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {batch.label}
                {batch.active && (
                  <span
                    className={`pill px-2 py-0.5 text-[0.6rem] ${
                      isActive
                        ? "bg-gold text-feu-moss"
                        : "bg-gold/20 text-amber-700"
                    }`}
                  >
                    <Star className="h-2.5 w-2.5" />
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active batch header */}
        <div
          key={activeBatch.id}
          className="mt-10 animate-fade-up rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-ink">
                  {activeBatch.label}
                </h3>
                {activeBatch.active && (
                  <span className="pill bg-gold text-feu-moss">
                    <Star className="h-3 w-3" />
                    Active Term
                  </span>
                )}
              </div>
              <p className="mt-1 font-semibold text-feu-green">
                {activeBatch.sy}
              </p>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                {activeBatch.tagline}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-cloud px-5 py-3 text-center">
              <div className="text-3xl font-black text-feu-green">
                {activeBatch.officers.length}
              </div>
              <div className="text-[0.7rem] uppercase tracking-wide text-slate-500">
                Officers
              </div>
            </div>
          </div>
        </div>

        {/* Officer grid */}
        <div
          key={`${activeBatch.id}-grid`}
          className="mt-8 grid animate-fade-up gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {activeBatch.officers.map((officer, i) => (
            <OfficerCard
              key={`${activeBatch.id}-${officer.position}-${i}`}
              officer={officer}
              index={i}
              onSelect={(o) => setSelected({ officer: o, batch: activeBatch })}
            />
          ))}
        </div>
      </div>

      {/* Officer profile modal */}
      {selected && (
        <OfficerProfileModal
          officer={selected.officer}
          batch={selected.batch}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
