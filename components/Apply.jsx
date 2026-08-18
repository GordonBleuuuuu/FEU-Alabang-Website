"use client";

import { useMemo, useState } from "react";
import {
  ClipboardList,
  Users,
  Sparkles,
  Rocket,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Bell,
  Info,
  Clock,
  CalendarDays,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Repeat,
  Paperclip,
  FileText,
  X,
} from "lucide-react";
import {
  APPLICATIONS_OPEN,
  SHOW_COUNTDOWN,
  APPLICATION_CYCLE,
  TIMELINE,
  committees,
  FAQ,
} from "@/data/committees";
import Countdown from "./Countdown";
import { uploadApplicationPdf } from "@/lib/supabase";

const MAX_FILE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

// Both the application form and the notify-me signup post to the same Forminit
// endpoint. Each submission is tagged via fi-select-category so ASCC can triage.
const FORMINIT_ENDPOINT =
  process.env.NEXT_PUBLIC_FORMINIT_ENDPOINT ||
  "https://forminit.com/f/ngl6g12r2nj";

// ---------- Timeline strip ----------
function TimelineStrip() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TIMELINE.map((t, i) => (
        <li
          key={t.step}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold text-sm font-black text-feu-moss shadow-gold">
              {t.step}
            </span>
            <div className="min-w-0">
              <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-gold">
                {t.date}
              </div>
              <div className="mt-0.5 text-base font-black">{t.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-white/70">
                {t.description}
              </p>
            </div>
          </div>
          {i < TIMELINE.length - 1 && (
            <ArrowRight className="pointer-events-none absolute -right-2 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-gold/40 lg:block" />
          )}
        </li>
      ))}
    </ol>
  );
}

// ---------- Committee cards ----------
function CommitteesGrid() {
  if (!committees.length) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {committees.map((c) => (
        <article
          key={c.name}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition hover:border-gold/40 hover:bg-white/[0.08]"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <h4 className="text-lg font-black">{c.name}</h4>
          </div>
          {c.description ? (
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {c.description}
            </p>
          ) : null}

          {(c.hoursPerWeek || c.meetingCadence) && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {c.hoursPerWeek && (
                <span className="pill bg-white/5 text-white/80 ring-1 ring-white/10">
                  <Clock className="h-3 w-3" />
                  {c.hoursPerWeek} / week
                </span>
              )}
              {c.meetingCadence && (
                <span className="pill bg-white/5 text-white/80 ring-1 ring-white/10">
                  <CalendarDays className="h-3 w-3" />
                  {c.meetingCadence}
                </span>
              )}
            </div>
          )}

          {c.responsibilities?.length ? (
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wider text-gold">
                Main Responsibilities
              </div>
              <ul className="space-y-2 text-sm text-white/70">
                {c.responsibilities.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

// ---------- FAQ accordion ----------
function FaqList() {
  const [openIdx, setOpenIdx] = useState(0);
  if (!FAQ.length) return null;
  return (
    <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
      {FAQ.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/5"
            >
              <span className="flex items-center gap-3 text-sm font-semibold sm:text-base">
                <HelpCircle className="h-4 w-4 shrink-0 text-gold" />
                {item.q}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-gold transition ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-white/75">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Notify-me signup (coming-soon state) ----------
function NotifyMeForm() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("_hp")) {
      setStatus("success");
      form.reset();
      return;
    }
    fd.delete("_hp");
    fd.set("fi-select-category", "Notify-me — Applications");
    fd.set(
      "fi-text-message",
      "Please notify me when SCC committee applications open."
    );
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch(FORMINIT_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
        setTimeout(() => setStatus("idle"), 6000);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Network error — please try again shortly.");
    }
  };
  const submitting = status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]"
    >
      <div className="sm:col-span-2">
        <label htmlFor="notify-name" className="mb-1.5 block text-sm font-medium text-white/80">
          Full name
        </label>
        <input
          id="notify-name"
          name="fi-sender-fullName"
          type="text"
          required
          disabled={submitting}
          placeholder="Juan Dela Cruz"
          className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
      </div>
      <div>
        <label htmlFor="notify-email" className="mb-1.5 block text-sm font-medium text-white/80">
          Email
        </label>
        <input
          id="notify-email"
          name="fi-sender-email"
          type="email"
          required
          disabled={submitting}
          placeholder="you@feualabang.edu.ph"
          className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={submitting}
          className="btn-gold w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              Signing up…
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : status === "success" ? (
            <>
              You&apos;re on the list!
              <CheckCircle2 className="h-4 w-4" />
            </>
          ) : (
            <>
              Notify me
              <Bell className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <input
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        style={{ display: "none" }}
      />

      {status === "success" && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-300 sm:col-span-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
          You&apos;re on the list — we&apos;ll email you the moment applications open.
        </p>
      )}
      {status === "error" && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-300 sm:col-span-2">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </form>
  );
}

// ---------- Full application form (open state) ----------
function ApplicationForm() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [first, setFirst] = useState(committees[0]?.name || "");
  const [second, setSecond] = useState("");
  const [third, setThird] = useState("");
  // Attached PDF (optional). `file` is the File object; `fileError` holds a
  // local validation message so we don't reject the whole form for a bad file.
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const firstCommittee = useMemo(
    () => committees.find((c) => c.name === first),
    [first]
  );

  const handleFileChange = (e) => {
    const picked = e.target.files?.[0];
    setFileError("");
    if (!picked) {
      setFile(null);
      return;
    }
    if (picked.type !== "application/pdf") {
      setFileError("Please upload a PDF file only.");
      setFile(null);
      e.target.value = "";
      return;
    }
    if (picked.size > MAX_FILE_BYTES) {
      setFileError(`File is too large. Max size is ${MAX_FILE_MB} MB.`);
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(picked);
  };

  const clearFile = () => {
    setFile(null);
    setFileError("");
    const input = document.getElementById("ap-resume");
    if (input) input.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("_hp")) {
      setStatus("success");
      form.reset();
      return;
    }
    fd.delete("_hp");
    // The file input is uploaded separately (below); don't ship the binary
    // to Forminit — we'd hit its free-tier limits.
    fd.delete("resume-file");
    fd.set("fi-select-category", "Committee Application");
    // Combine ranked choices into one readable field
    const ranked = [first, second, third].filter(Boolean).join(" → ");
    fd.set("fi-text-choices", ranked);
    // When the committee only offers one role, the dropdown is hidden — inject
    // the default role so Forminit still receives the field.
    if (firstCommittee && firstCommittee.roles?.length === 1) {
      fd.set("fi-select-preferredRole", firstCommittee.roles[0].name);
    }
    setError("");

    // Upload the PDF to Supabase Storage first, then attach the public URL
    // to the Forminit submission so ASCC can download from the dashboard.
    try {
      if (file) {
        setStatus("uploading");
        const publicUrl = await uploadApplicationPdf(file);
        fd.set("fi-text-resumeUrl", publicUrl);
      }
    } catch (err) {
      setStatus("error");
      setError(
        "Couldn't upload your attachment. Please try again, or submit without it."
      );
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch(FORMINIT_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
        setFirst(committees[0]?.name || "");
        setSecond("");
        setThird("");
        clearFile();
        setTimeout(() => setStatus("idle"), 8000);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Network error — please try again shortly.");
    }
  };

  const busy = status === "submitting" || status === "uploading";
  const submitting = busy; // legacy alias for existing disabled= props
  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-60";

  // Options for 2nd/3rd choice — exclude already-picked committees.
  const optionsExcluding = (exclude) =>
    committees.filter((c) => !exclude.includes(c.name));

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ap-name" className="mb-1.5 block text-sm font-medium text-white/85">
            Full name
          </label>
          <input id="ap-name" name="fi-sender-fullName" type="text" required disabled={submitting} placeholder="Juan Dela Cruz" className={inputClass} />
        </div>
        <div>
          <label htmlFor="ap-email" className="mb-1.5 block text-sm font-medium text-white/85">
            FEU email
          </label>
          <input id="ap-email" name="fi-sender-email" type="email" required disabled={submitting} placeholder="you@feualabang.edu.ph" className={inputClass} />
        </div>
        <div>
          <label htmlFor="ap-program" className="mb-1.5 block text-sm font-medium text-white/85">
            Program / Course
          </label>
          <input id="ap-program" name="fi-text-program" type="text" required disabled={submitting} placeholder="e.g. BS Information Technology" className={inputClass} />
        </div>
        <div>
          <label htmlFor="ap-year" className="mb-1.5 block text-sm font-medium text-white/85">
            Year level
          </label>
          <input id="ap-year" name="fi-text-year" type="text" required disabled={submitting} placeholder="e.g. 3rd year" className={inputClass} />
        </div>

        {/* Ranked committee choices */}
        <div className="sm:col-span-2 rounded-2xl border border-gold/25 bg-gold/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gold">
            <Repeat className="h-4 w-4" />
            Rank your committee choices
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="ap-first" className="mb-1.5 block text-xs font-medium text-white/70">
                1st choice (required)
              </label>
              <select
                id="ap-first"
                name="fi-select-firstChoice"
                value={first}
                onChange={(e) => {
                  setFirst(e.target.value);
                  if (second === e.target.value) setSecond("");
                  if (third === e.target.value) setThird("");
                }}
                required
                disabled={submitting}
                className={inputClass}
              >
                {committees.map((c) => (
                  <option key={c.name} value={c.name} className="bg-feu-green text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ap-second" className="mb-1.5 block text-xs font-medium text-white/70">
                2nd choice (optional)
              </label>
              <select
                id="ap-second"
                name="fi-select-secondChoice"
                value={second}
                onChange={(e) => {
                  setSecond(e.target.value);
                  if (third === e.target.value) setThird("");
                }}
                disabled={submitting}
                className={inputClass}
              >
                <option value="" className="bg-feu-green text-white">— None —</option>
                {optionsExcluding([first]).map((c) => (
                  <option key={c.name} value={c.name} className="bg-feu-green text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ap-third" className="mb-1.5 block text-xs font-medium text-white/70">
                3rd choice (optional)
              </label>
              <select
                id="ap-third"
                name="fi-select-thirdChoice"
                value={third}
                onChange={(e) => setThird(e.target.value)}
                disabled={submitting || !second}
                className={inputClass}
              >
                <option value="" className="bg-feu-green text-white">— None —</option>
                {optionsExcluding([first, second]).map((c) => (
                  <option key={c.name} value={c.name} className="bg-feu-green text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {firstCommittee?.roles && firstCommittee.roles.length > 1 && (
          <div>
            <label htmlFor="ap-role" className="mb-1.5 block text-sm font-medium text-white/85">
              Preferred role in your 1st choice
            </label>
            <select
              id="ap-role"
              name="fi-select-preferredRole"
              disabled={submitting}
              className={inputClass}
            >
              {firstCommittee.roles.map((r) => (
                <option key={r.name} value={r.name} className="bg-feu-green text-white">
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="ap-contact" className="mb-1.5 block text-sm font-medium text-white/85">
            Contact number
            <span className="ml-1 text-xs font-normal text-white/50">(optional)</span>
          </label>
          <input id="ap-contact" name="fi-text-contact" type="tel" disabled={submitting} placeholder="09xx xxx xxxx" className={inputClass} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="ap-motivation" className="mb-1.5 block text-sm font-medium text-white/85">
            Why do you want to join?
          </label>
          <textarea id="ap-motivation" name="fi-text-motivation" rows={4} required disabled={submitting} placeholder="Share what draws you to this committee and what you'd bring to the table…" className={`${inputClass} resize-none`} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ap-experience" className="mb-1.5 block text-sm font-medium text-white/85">
            Past leadership / relevant experience
            <span className="ml-1 text-xs font-normal text-white/50">(optional)</span>
          </label>
          <textarea id="ap-experience" name="fi-text-experience" rows={3} disabled={submitting} placeholder="Positions held, projects led, skills you'd bring…" className={`${inputClass} resize-none`} />
        </div>

        {/* Resume / Portfolio PDF upload (optional) */}
        <div className="sm:col-span-2">
          <label htmlFor="ap-resume" className="mb-1.5 block text-sm font-medium text-white/85">
            Resume / Portfolio (PDF)
            <span className="ml-1 text-xs font-normal text-white/50">
              (optional · max {MAX_FILE_MB} MB)
            </span>
          </label>
          {!file ? (
            <label
              htmlFor="ap-resume"
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-white/25 bg-white/5 px-4 py-3 text-sm text-white/70 transition hover:border-gold/50 hover:bg-white/10 ${
                submitting ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-gold" />
                Choose a PDF to attach
              </span>
              <span className="text-xs text-white/50">Browse…</span>
            </label>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-white">
              <span className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-gold" />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-white/50">
                  · {(file.size / 1024).toFixed(0)} KB
                </span>
              </span>
              <button
                type="button"
                onClick={clearFile}
                disabled={submitting}
                aria-label="Remove attachment"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <input
            id="ap-resume"
            name="resume-file"
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            disabled={submitting}
            className="hidden"
          />
          {fileError && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-300">
              <AlertCircle className="h-3.5 w-3.5" />
              {fileError}
            </p>
          )}
        </div>

        <input type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" style={{ display: "none" }} />

        <div className="sm:col-span-2">
          <button type="submit" disabled={busy} className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-70">
            {status === "uploading" ? (
              <>Uploading attachment… <Loader2 className="h-4 w-4 animate-spin" /></>
            ) : status === "submitting" ? (
              <>Submitting… <Loader2 className="h-4 w-4 animate-spin" /></>
            ) : status === "success" ? (
              <>Application received! <CheckCircle2 className="h-4 w-4" /></>
            ) : (
              <>Submit application <Send className="h-4 w-4" /></>
            )}
          </button>
          {status === "success" && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Thanks — the SCC will review your application and reach out via email.
            </p>
          )}
          {status === "error" && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-red-300">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
          {status === "idle" && (
            <p className="mt-3 text-center text-xs text-white/50">
              Submissions go directly to the SCC via our forms backend.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

// ============================================================================
export default function Apply() {
  return (
    <section id="apply" className="relative overflow-hidden bg-feu-moss py-24 text-white">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #0A3D1F 0%, #004B23 50%, #0F5257 100%)",
        }}
      />
      <div className="absolute inset-0 bg-grid-fade [background-size:40px_40px] opacity-25" />
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-feu-teal/40 blur-3xl" />

      <div className="container-px relative">
        {/* --- Header --- */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="pill glass text-gold">
            <ClipboardList className="h-3.5 w-3.5" />
            Join the Council · {APPLICATION_CYCLE.termLabel}
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Apply to an SCC Committee
          </h2>
          <p className="mt-4 text-lg text-white/75">
            The Student Coordinating Council is powered by committee members who
            bring the ATamaraw experience to life. Find your fit and be part of
            the movement.
          </p>
        </div>

        {/* --- Countdown (hidden until SHOW_COUNTDOWN is flipped on) --- */}
        {SHOW_COUNTDOWN && (
          <div className="mt-10 flex flex-col items-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold/80">
              {APPLICATIONS_OPEN
                ? "Applications close in"
                : "Applications open in"}
            </div>
            <div className="mt-3">
              <Countdown
                targetIso={
                  APPLICATIONS_OPEN
                    ? APPLICATION_CYCLE.closesAt
                    : APPLICATION_CYCLE.opensAt
                }
                passedLabel={
                  APPLICATIONS_OPEN ? "Applications closed" : "Now open!"
                }
              />
            </div>
          </div>
        )}

        {/* --- Timeline --- */}
        <div className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-gold" />
            <h3 className="text-xl font-black">Application timeline</h3>
          </div>
          <TimelineStrip />
        </div>

        {/* --- Committees --- */}
        <div className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <Users className="h-5 w-5 text-gold" />
            <h3 className="text-xl font-black">What you can join</h3>
          </div>
          <CommitteesGrid />
        </div>

        {/* --- Form area --- */}
        <div className="mt-16">
          {!APPLICATIONS_OPEN ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl sm:p-10">
              <div className="flex flex-col items-center text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold text-feu-moss shadow-gold">
                  <Rocket className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-2xl font-black">
                  Applications open soon
                </h3>
                <p className="mt-3 max-w-md text-white/70">
                  Drop your details and we&apos;ll email you the moment the form
                  goes live.
                </p>
                <div className="w-full max-w-md">
                  <NotifyMeForm />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 text-sm text-white/70">
                <Info className="h-4 w-4 text-gold" />
                Every field is reviewed. Take your time — this is your pitch.
              </div>
              {committees.length > 0 ? (
                <ApplicationForm />
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-white/70">
                  Committee list is being finalized. Please check back soon.
                </div>
              )}
            </>
          )}
        </div>

        {/* --- FAQ --- */}
        <div className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-gold" />
            <h3 className="text-xl font-black">Frequently asked</h3>
          </div>
          <FaqList />
        </div>
      </div>
    </section>
  );
}
