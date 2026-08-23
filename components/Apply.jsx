"use client";

import { useEffect, useMemo, useState } from "react";
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
  Download,
  FileDown,
  ShieldCheck,
} from "lucide-react";
import {
  APPLICATIONS_ENABLED,
  SHOW_COUNTDOWN,
  APPLICATION_CYCLE,
  getActiveApplicationWindow,
  getNextApplicationWindow,
  TIMELINE,
  committees,
  FAQ,
} from "@/data/committees";
import Countdown from "./Countdown";
import {
  uploadApplicationPdf,
  uploadSchoolIdFile,
  insertCommitteeApplication,
} from "@/lib/supabase";

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
// Renders two clearly-labeled groups so applicants don't confuse committee
// membership (regular applications) with leadership seats (Directors,
// Course Reps). Each card opens the CommitteeDetailModal.
function CommitteeCard({ c, isSelected, onOpen }) {
  const cardClass = `group w-full rounded-2xl border p-6 text-left backdrop-blur-sm transition ${
    isSelected
      ? "border-gold bg-gold/10 shadow-gold ring-1 ring-gold/40"
      : "border-white/10 bg-white/[0.04] hover:-translate-y-0.5 hover:border-gold/40 hover:bg-white/[0.08]"
  } cursor-pointer`;
  return (
    <button type="button" onClick={() => onOpen(c)} className={cardClass}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <h4 className="text-lg font-black">{c.name}</h4>
        </div>
        {isSelected && (
          <span className="pill bg-gold text-feu-moss">
            <CheckCircle2 className="h-3 w-3" />
            1st choice
          </span>
        )}
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

      {(c.responsibilities?.length || c.requirements?.length) ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/10 pt-4 text-xs text-white/60">
          {c.requirements?.length ? (
            <span className="font-semibold uppercase tracking-wider text-gold">
              ⚑ {c.requirements.length} requirements
            </span>
          ) : null}
          {c.responsibilities?.length ? (
            <span className="font-semibold uppercase tracking-wider text-gold">
              • {c.responsibilities.length} responsibilities
            </span>
          ) : null}
          <span>— tap to view details</span>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-gold/80 transition group-hover:text-gold">
        View details
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

function CommitteesGrid({ onOpen, selected, availableCommittees }) {
  if (!availableCommittees.length) return null;

  const committeeItems = availableCommittees.filter(
    (c) => (c.type || "committee") === "committee"
  );
  const leadershipItems = availableCommittees.filter((c) => c.type === "leadership");

  return (
    <div className="space-y-10">
      {committeeItems.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="pill bg-white/10 text-gold ring-1 ring-white/15">
              Committees
            </span>
            <span className="text-xs text-white/50">
              Join a team that powers SCC events and operations
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {committeeItems.map((c) => (
              <CommitteeCard
                key={c.name}
                c={c}
                isSelected={selected === c.name}
                onOpen={onOpen}
              />
            ))}
          </div>
        </div>
      )}

      {leadershipItems.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="pill bg-gold/15 text-gold ring-1 ring-gold/30">
              Leadership Positions
            </span>
            <span className="text-xs text-white/50">
              Senior seats — Directors and Course Representatives
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {leadershipItems.map((c) => (
              <CommitteeCard
                key={c.name}
                c={c}
                isSelected={selected === c.name}
                onOpen={onOpen}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Committee detail modal ----------
// Opens on committee card click. Shows the full description + responsibilities
// in a spacious layout, and (when applications are open) offers a prominent
// "Choose this as 1st choice" button that selects + closes + scrolls to form.
function CommitteeDetailModal({ committee, onClose, onChoose, selected }) {
  useEffect(() => {
    if (!committee) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [committee, onClose]);

  if (!committee) return null;
  const isSelected = selected === committee.name;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="committee-detail-name"
    >
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white text-ink shadow-2xl animate-fade-up">
        {/* Header */}
        <div
          className="relative p-6 text-white sm:p-8"
          style={{ background: "linear-gradient(135deg, #004B23, #0F5257)" }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="pill bg-white/15 text-gold ring-1 ring-white/20">
            <Sparkles className="h-3.5 w-3.5" />
            SCC Committee
          </span>
          <h3
            id="committee-detail-name"
            className="mt-3 text-2xl font-black leading-tight sm:text-3xl"
          >
            {committee.name}
          </h3>
          {committee.description ? (
            <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
              {committee.description}
            </p>
          ) : null}
          {(committee.hoursPerWeek || committee.meetingCadence) && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {committee.hoursPerWeek && (
                <span className="pill bg-white/10 text-white ring-1 ring-white/20">
                  <Clock className="h-3 w-3" />
                  {committee.hoursPerWeek} / week
                </span>
              )}
              {committee.meetingCadence && (
                <span className="pill bg-white/10 text-white ring-1 ring-white/20">
                  <CalendarDays className="h-3 w-3" />
                  {committee.meetingCadence}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[50vh] overflow-y-auto p-6 sm:p-8">
          {committee.requirements?.length ? (
            <div className="mb-8 rounded-2xl border border-gold/40 bg-gold/10 p-5">
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-feu-green">
                <ShieldCheck className="h-4 w-4" /> Requirements to Apply
              </h4>
              <ul className="mt-3 space-y-2.5">
                {committee.requirements.map((r, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-[0.95rem] leading-relaxed text-slate-800"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-feu-green" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {committee.responsibilities?.length ? (
            <>
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-feu-green">
                <Sparkles className="h-4 w-4" /> Main Responsibilities
              </h4>
              <ul className="mt-4 space-y-4">
                {committee.responsibilities.map((r, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-feu-green/10 text-xs font-black text-feu-green">
                      {i + 1}
                    </span>
                    <span className="text-[0.95rem] leading-relaxed text-slate-700">
                      {r}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : !committee.requirements?.length ? (
            <p className="text-sm text-slate-500">
              Details for this committee are being finalized.
            </p>
          ) : null}
        </div>

        {/* Footer — choose-this action when the form is open */}
        {onChoose && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-cloud px-6 py-4 sm:px-8">
            <p className="text-xs text-slate-500">
              {isSelected
                ? "This is your current 1st choice."
                : "Ready to apply? Set this as your 1st choice."}
            </p>
            <button
              type="button"
              onClick={() => onChoose(committee.name)}
              className={
                isSelected
                  ? "btn-green px-5 py-2.5 text-sm"
                  : "btn-gold px-5 py-2.5 text-sm"
              }
            >
              {isSelected ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Selected — go to form
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Choose as 1st choice
                </>
              )}
            </button>
          </div>
        )}
      </div>
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
// The 1st/2nd/3rd choice state is owned by the parent Apply component so that
// the CommitteesGrid can also drive it — clicking a committee card selects it
// as the applicant's 1st choice.
function ApplicationForm({
  first,
  setFirst,
  second,
  setSecond,
  third,
  setThird,
  availableCommittees,
}) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  // Attached files (both optional). `file` is the resume/portfolio PDF;
  // `schoolIdFile` is the applicant's school ID (image or PDF).
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [schoolIdFile, setSchoolIdFile] = useState(null);
  const [schoolIdError, setSchoolIdError] = useState("");
  // Data Privacy Act consent — required to submit.
  const [dpaConsent, setDpaConsent] = useState(false);

  const firstCommittee = useMemo(
    () => availableCommittees.find((c) => c.name === first),
    [availableCommittees, first]
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

  // School ID accepts PDF or common image formats.
  const SCHOOL_ID_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  const handleSchoolIdChange = (e) => {
    const picked = e.target.files?.[0];
    setSchoolIdError("");
    if (!picked) {
      setSchoolIdFile(null);
      return;
    }
    if (!SCHOOL_ID_TYPES.includes(picked.type)) {
      setSchoolIdError("School ID must be a PDF, JPG, PNG, or WebP file.");
      setSchoolIdFile(null);
      e.target.value = "";
      return;
    }
    if (picked.size > MAX_FILE_BYTES) {
      setSchoolIdError(`File is too large. Max size is ${MAX_FILE_MB} MB.`);
      setSchoolIdFile(null);
      e.target.value = "";
      return;
    }
    setSchoolIdFile(picked);
  };

  const clearSchoolId = () => {
    setSchoolIdFile(null);
    setSchoolIdError("");
    const input = document.getElementById("ap-school-id");
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
    // Data Privacy Act consent guard.
    if (!dpaConsent) {
      setStatus("error");
      setError(
        "Please tick the Data Privacy Act consent below before submitting."
      );
      return;
    }
    // Required attachments guard.
    if (!file) {
      setStatus("error");
      setError(
        "Please attach your filled-out Officer Information Sheet (PDF) before submitting."
      );
      return;
    }
    if (!schoolIdFile) {
      setStatus("error");
      setError(
        "Please attach a photo or scan of your School ID before submitting."
      );
      return;
    }

    // The file inputs are uploaded separately (below); don't ship the binaries
    // to Forminit — we'd hit its free-tier limits.
    fd.delete("resume-file");
    fd.delete("school-id-file");
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

    // Upload attached files to Supabase Storage first, then attach their public
    // URLs to the Forminit submission so ASCC can download from the dashboard.
    try {
      if (file || schoolIdFile) setStatus("uploading");
      if (file) {
        const publicUrl = await uploadApplicationPdf(file);
        fd.set("fi-text-resumeUrl", publicUrl);
      }
      if (schoolIdFile) {
        const publicUrl = await uploadSchoolIdFile(schoolIdFile);
        fd.set("fi-text-schoolIdUrl", publicUrl);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("File upload error:", err);
      setStatus("error");
      // Show the real cause when we can — Supabase Storage errors are the
      // usual culprit (mime-type restriction, file-size cap, or RLS policy).
      const raw = err?.message || err?.error || "Unknown error";
      const friendly = /mime|type/i.test(raw)
        ? "This file type isn't accepted. Please use PDF for the OIS and PDF/JPG/PNG for the School ID."
        : /size|too large|exceeds/i.test(raw)
        ? `File is too large. Max ${MAX_FILE_MB} MB.`
        : /policy|permission|denied|unauthorized/i.test(raw)
        ? "Upload was rejected by the server. Please try again in a moment."
        : /network|failed to fetch|timeout/i.test(raw)
        ? "Network hiccup — please try again in a moment."
        : `Couldn't upload your attachment. (${raw})`;
      setError(friendly);
      return;
    }

    setStatus("submitting");

    // Insert into Supabase Postgres for structured storage / ASCC review.
    // Fails soft — if Supabase hiccups, the applicant still succeeds via
    // Forminit (email notification + dashboard), and we log the mismatch.
    try {
      await insertCommitteeApplication({
        name: fd.get("fi-sender-fullName"),
        email: fd.get("fi-sender-email"),
        program: fd.get("fi-text-program"),
        year_level: fd.get("fi-text-year"),
        contact_number: fd.get("fi-text-contact") || null,
        first_choice: first,
        second_choice: second || null,
        third_choice: third || null,
        preferred_role: fd.get("fi-select-preferredRole") || null,
        motivation: fd.get("fi-text-motivation"),
        past_experience: fd.get("fi-text-experience") || null,
        resume_url: fd.get("fi-text-resumeUrl") || null,
        school_id_url: fd.get("fi-text-schoolIdUrl") || null,
        dpa_consent: true,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Supabase committee_applications insert failed:", err);
    }

    // Include DPA consent in the Forminit payload too, so ASCC's email trail
    // records that the applicant agreed.
    fd.set("fi-text-dpaConsent", "Yes — agreed to Data Privacy Act consent");

    try {
      const res = await fetch(FORMINIT_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
        setFirst(availableCommittees[0]?.name || "");
        setSecond("");
        setThird("");
        clearFile();
        clearSchoolId();
        setDpaConsent(false);
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
    availableCommittees.filter((c) => !exclude.includes(c.name));

  // Render options grouped into Committees + Leadership Positions using
  // <optgroup> so the two sets stay visually separated in the dropdown too.
  const renderGroupedOptions = (list) => {
    const committeeItems = list.filter(
      (c) => (c.type || "committee") === "committee"
    );
    const leadershipItems = list.filter((c) => c.type === "leadership");
    return (
      <>
        {committeeItems.length > 0 && (
          <optgroup label="Committees" className="bg-feu-green text-white">
            {committeeItems.map((c) => (
              <option
                key={c.name}
                value={c.name}
                className="bg-feu-green text-white"
              >
                {c.name}
              </option>
            ))}
          </optgroup>
        )}
        {leadershipItems.length > 0 && (
          <optgroup
            label="Leadership Positions"
            className="bg-feu-green text-white"
          >
            {leadershipItems.map((c) => (
              <option
                key={c.name}
                value={c.name}
                className="bg-feu-green text-white"
              >
                {c.name}
              </option>
            ))}
          </optgroup>
        )}
      </>
    );
  };

  return (
    <form
      id="ap-form"
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8 scroll-mt-24"
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

        {/* Ranked choices — committees OR leadership positions */}
        <div className="sm:col-span-2 rounded-2xl border border-gold/25 bg-gold/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gold">
            <Repeat className="h-4 w-4" />
            Rank your choices
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
                {renderGroupedOptions(availableCommittees)}
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
                {renderGroupedOptions(optionsExcluding([first]))}
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
                {renderGroupedOptions(optionsExcluding([first, second]))}
              </select>
            </div>
          </div>
        </div>

        {firstCommittee?.roles && firstCommittee.roles.length > 1 && (
          <div>
            <label htmlFor="ap-role" className="mb-1.5 block text-sm font-medium text-white/85">
              {first === "Board of Directors"
                ? "Which director seat are you applying for?"
                : first === "Course Representative"
                ? "Which degree program do you represent?"
                : "Preferred role in your 1st choice"}
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

        {/* Attachments — two file inputs side-by-side */}
        <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
          {/* Officer Information Sheet PDF (required) */}
          <div>
            <label htmlFor="ap-resume" className="mb-1.5 block text-sm font-medium text-white/85">
              Officer Information Sheet (PDF)
              <span className="ml-1 text-xs font-normal text-gold">
                (required · max {MAX_FILE_MB} MB)
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
                  Upload filled-out sheet (PDF)
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
            <p className="mt-2 text-xs text-gold/80">
              Filename:{" "}
              <span className="font-mono font-semibold">
                OIS_Surname and Name
              </span>{" "}
              (e.g. <span className="font-mono">OIS_Dela Cruz Juan</span>)
            </p>
            {fileError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-300">
                <AlertCircle className="h-3.5 w-3.5" />
                {fileError}
              </p>
            )}
          </div>

          {/* School ID upload (required — PDF or image) */}
          <div>
            <label htmlFor="ap-school-id" className="mb-1.5 block text-sm font-medium text-white/85">
              School ID (PDF or image)
              <span className="ml-1 text-xs font-normal text-gold">
                (required · max {MAX_FILE_MB} MB)
              </span>
            </label>
            {!schoolIdFile ? (
              <label
                htmlFor="ap-school-id"
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-white/25 bg-white/5 px-4 py-3 text-sm text-white/70 transition hover:border-gold/50 hover:bg-white/10 ${
                  submitting ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-gold" />
                  Upload School ID
                </span>
                <span className="text-xs text-white/50">Browse…</span>
              </label>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-white">
                <span className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-gold" />
                  <span className="truncate">{schoolIdFile.name}</span>
                  <span className="shrink-0 text-xs text-white/50">
                    · {(schoolIdFile.size / 1024).toFixed(0)} KB
                  </span>
                </span>
                <button
                  type="button"
                  onClick={clearSchoolId}
                  disabled={submitting}
                  aria-label="Remove school ID"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <input
              id="ap-school-id"
              name="school-id-file"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleSchoolIdChange}
              disabled={submitting}
              className="hidden"
            />
            <p className="mt-2 text-xs text-white/60">
              💡 Photo upload failing? Save your ID as a{" "}
              <span className="font-semibold text-gold">PDF</span> first — see
              FAQ below for how.
            </p>
            {schoolIdError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-300">
                <AlertCircle className="h-3.5 w-3.5" />
                {schoolIdError}
              </p>
            )}
          </div>
        </div>

        {/* Data Privacy Act consent — required */}
        <div className="sm:col-span-2">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
              dpaConsent
                ? "border-gold/50 bg-gold/10"
                : "border-white/15 bg-white/5 hover:border-gold/30 hover:bg-white/10"
            }`}
          >
            <input
              type="checkbox"
              checked={dpaConsent}
              onChange={(e) => {
                setDpaConsent(e.target.checked);
                if (e.target.checked) setError("");
              }}
              disabled={submitting}
              className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
            />
            <span className="text-sm text-white/85">
              <span className="font-semibold text-gold">
                Data Privacy Act consent (required)
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-white/70">
                I have read and freely consent to the collection, use, storage,
                and processing of my personal information in accordance with the
                <span className="font-semibold">
                  {" "}
                  Data Privacy Act of 2012 (R.A. 10173){" "}
                </span>
                for the sole purpose of my SCC Committee Application. My data
                will be handled confidentially by the FEU Alabang Student
                Coordinating Council and will not be shared with third parties.
              </span>
            </span>
          </label>
        </div>

        <input type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" style={{ display: "none" }} />

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={busy || !dpaConsent || !file || !schoolIdFile}
            title={
              !file
                ? "Please attach your Officer Information Sheet (PDF)"
                : !schoolIdFile
                ? "Please attach a photo/scan of your School ID"
                : !dpaConsent
                ? "Please tick the Data Privacy consent above"
                : ""
            }
            className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-70"
          >
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
  // Start closed for SSR/hydration consistency, then determine availability on
  // the client so the static page automatically follows the configured dates.
  const [applicationWindow, setApplicationWindow] = useState(null);
  const applicationsOpen = APPLICATIONS_ENABLED && Boolean(applicationWindow);

  useEffect(() => {
    const updateApplicationWindow = () => {
      setApplicationWindow(getActiveApplicationWindow());
    };
    updateApplicationWindow();
    const interval = setInterval(updateApplicationWindow, 60_000);
    return () => clearInterval(interval);
  }, []);

  const nextApplicationWindow = getNextApplicationWindow();
  const configuredWindow = applicationWindow || nextApplicationWindow;
  const availableCommittees = configuredWindow?.eligibleCommittees
    ? committees.filter((committee) =>
        configuredWindow.eligibleCommittees.includes(committee.name)
      )
    : committees;

  // Committee-choice state lives here so both the detail modal ("Choose as 1st
  // choice" button) and the ApplicationForm (dropdowns) can read + update it.
  const [first, setFirst] = useState(
    applicationsOpen ? availableCommittees[0]?.name || "" : ""
  );
  const [second, setSecond] = useState("");
  const [third, setThird] = useState("");

  useEffect(() => {
    if (applicationsOpen && !first) {
      setFirst(availableCommittees[0]?.name || "");
    }
  }, [applicationsOpen, availableCommittees, first]);

  // Committee currently open in the detail modal (null when closed).
  const [openedCommittee, setOpenedCommittee] = useState(null);

  // Called from inside the detail modal: sets the committee as 1st choice,
  // closes the modal, and smoothly scrolls the form into view.
  const handleChooseCommittee = (name) => {
    setFirst(name);
    if (second === name) setSecond("");
    if (third === name) setThird("");
    setOpenedCommittee(null);
    setTimeout(() => {
      const target = document.getElementById("ap-form");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

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
        {SHOW_COUNTDOWN && (applicationsOpen || nextApplicationWindow) && (
          <div className="mt-10 flex flex-col items-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold/80">
              {applicationsOpen
                ? "Applications close in"
                : "Applications open in"}
            </div>
            <div className="mt-3">
              <Countdown
                targetIso={
                  applicationsOpen
                    ? applicationWindow.closesAt
                    : nextApplicationWindow.opensAt
                }
                passedLabel={
                  applicationsOpen ? "Applications closed" : "Now open!"
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

        {/* --- Required document (Officer Information Sheet) --- */}
        <div className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <FileDown className="h-5 w-5 text-gold" />
            <h3 className="text-xl font-black">Required document</h3>
          </div>
          <div
            className="flex flex-col items-start gap-5 rounded-3xl border p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-8"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,183,3,0.10), rgba(15,82,87,0.20))",
              borderColor: "rgba(255,183,3,0.35)",
            }}
          >
            <div className="flex items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gold text-feu-moss shadow-gold">
                <FileText className="h-7 w-7" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gold">
                  .docx · Fill out before applying
                </div>
                <h4 className="mt-1 text-lg font-black sm:text-xl">
                  Officer Information Sheet
                </h4>
                <p className="mt-1 max-w-xl text-sm text-white/75">
                  Download this Word file, fill out all your details, save it as
                  a PDF, and upload it in the application form&apos;s attachment
                  field.
                </p>
                <p className="mt-2 max-w-xl text-xs font-semibold text-gold">
                  ⚠ Save your PDF as{" "}
                  <span className="font-mono">OIS_Surname and Name</span>{" "}
                  (e.g. <span className="font-mono">OIS_Dela Cruz Juan</span>)
                  before uploading.
                </p>
              </div>
            </div>
            <a
              href="/003OFFICER%20INFORMATION%20SHEET.docx"
              download="Officer Information Sheet.docx"
              className="btn-gold shrink-0 self-stretch sm:self-auto"
            >
              <Download className="h-4 w-4" />
              Download .docx
            </a>
          </div>
        </div>

        {/* --- Committees --- */}
        <div className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <Users className="h-5 w-5 text-gold" />
            <h3 className="text-xl font-black">What you can join</h3>
          </div>
          <CommitteesGrid
            onOpen={setOpenedCommittee}
            selected={first}
            availableCommittees={availableCommittees}
          />
        </div>

        {/* --- Form area --- */}
        <div className="mt-16">
          {!applicationsOpen ? (
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
              {availableCommittees.length > 0 ? (
                <ApplicationForm
                  first={first}
                  setFirst={setFirst}
                  second={second}
                  setSecond={setSecond}
                  third={third}
                  setThird={setThird}
                  availableCommittees={availableCommittees}
                />
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

      {/* Committee detail modal — opens from any committee card click */}
      <CommitteeDetailModal
        committee={openedCommittee}
        onClose={() => setOpenedCommittee(null)}
        onChoose={applicationsOpen ? handleChooseCommittee : null}
        selected={first}
      />
    </section>
  );
}
