"use client";

import { useEffect, useState } from "react";
import {
  HelpCircle,
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

// -----------------------------------------------------------------------------
// Direct Feedback / Student Grievance Desk
//
// Opens a modal with a categorized inquiry form that submits to the same
// Forminit endpoint used by the main contact form. Each submission is tagged
// with its category so ASCC can triage. Students may submit anonymously by
// checking the box — name and email fields become optional in that case.
// -----------------------------------------------------------------------------
const FORMINIT_ENDPOINT =
  process.env.NEXT_PUBLIC_FORMINIT_ENDPOINT ||
  "https://forminit.com/f/ngl6g12r2nj";

const CATEGORIES = [
  { value: "Inquiry", label: "General Inquiry" },
  { value: "Academic Concern", label: "Academic Concern" },
  { value: "Suggestion", label: "Suggestion / Feedback" },
  { value: "Grievance", label: "Grievance / Complaint" },
  { value: "Other", label: "Other" },
];

export default function StudentSupport() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0].value);

  // Escape-to-close + body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot — bots fill this hidden field; real users never do.
    if (fd.get("_hp")) {
      setStatus("success");
      form.reset();
      return;
    }
    fd.delete("_hp");

    // Anonymous submissions still need placeholder values so Forminit can
    // parse the sender block cleanly.
    if (anonymous) {
      fd.set("fi-sender-fullName", "Anonymous Student");
      fd.set("fi-sender-email", "no-reply@scc-anonymous.local");
    }

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
        setAnonymous(false);
        setCategory(CATEGORIES[0].value);
        setTimeout(() => {
          setStatus("idle");
          setOpen(false);
        }, 2500);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setError(
          data.message || "Something went wrong. Please try again shortly."
        );
      }
    } catch {
      setStatus("error");
      setError("Network error — please try again in a moment.");
    }
  };

  const submitting = status === "submitting";
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink placeholder-slate-400 outline-none transition focus:border-feu-green focus:ring-2 focus:ring-feu-green/20 disabled:opacity-60";

  return (
    <>
      {/* Card — matches the other resource cards, opens the modal */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 hover:bg-white/[0.08]"
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold text-feu-moss shadow-gold transition group-hover:scale-105">
          <HelpCircle className="h-7 w-7" />
        </span>
        <h3 className="mt-5 text-lg font-bold">Help &amp; Support</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          Send inquiries, academic concerns, or suggestions to the SCC —
          anonymously if you prefer.
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold">
          Reach the council
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-title"
        >
          <div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={() => (submitting ? null : setOpen(false))}
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white text-ink shadow-2xl animate-fade-up">
            {/* Header — inline gradient so it always renders */}
            <div
              className="relative p-6 text-white"
              style={{ background: "linear-gradient(135deg, #004B23, #0F5257)" }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={submitting}
                aria-label="Close"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
              <span className="pill bg-white/15 text-gold ring-1 ring-white/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Direct Feedback
              </span>
              <h3
                id="support-title"
                className="mt-3 text-xl font-black leading-tight"
              >
                Student Grievance Desk
              </h3>
              <p className="mt-1 text-sm text-white/75">
                Your message goes directly to the SCC. Submit anonymously by
                ticking the box below.
              </p>
            </div>

            {/* Body */}
            <form
              onSubmit={handleSubmit}
              className="max-h-[60vh] overflow-y-auto p-6"
            >
              <div className="grid gap-4">
                {/* Category */}
                <div>
                  <label
                    htmlFor="ss-category"
                    className="mb-1.5 block text-sm font-semibold text-ink"
                  >
                    Category
                  </label>
                  <select
                    id="ss-category"
                    name="fi-select-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={submitting}
                    className={inputClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Anonymous toggle */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-cloud px-4 py-3">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    disabled={submitting}
                    className="mt-0.5 h-4 w-4 accent-feu-green"
                  />
                  <span className="text-sm">
                    <span className="font-semibold text-ink">
                      Submit anonymously
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Your name and email won&apos;t be included with the
                      submission.
                    </span>
                  </span>
                </label>

                {/* Name */}
                <div>
                  <label
                    htmlFor="ss-name"
                    className="mb-1.5 block text-sm font-semibold text-ink"
                  >
                    Full name{" "}
                    {anonymous ? (
                      <span className="text-xs font-normal text-slate-400">
                        (hidden — anonymous)
                      </span>
                    ) : null}
                  </label>
                  <input
                    id="ss-name"
                    name="fi-sender-fullName"
                    type="text"
                    required={!anonymous}
                    disabled={submitting || anonymous}
                    placeholder="Juan Dela Cruz"
                    className={inputClass}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="ss-email"
                    className="mb-1.5 block text-sm font-semibold text-ink"
                  >
                    Email{" "}
                    {anonymous ? (
                      <span className="text-xs font-normal text-slate-400">
                        (hidden — anonymous)
                      </span>
                    ) : null}
                  </label>
                  <input
                    id="ss-email"
                    name="fi-sender-email"
                    type="email"
                    required={!anonymous}
                    disabled={submitting || anonymous}
                    placeholder="you@feualabang.edu.ph"
                    className={inputClass}
                  />
                </div>

                {/* Program / Year (optional even for named submissions) */}
                <div>
                  <label
                    htmlFor="ss-program"
                    className="mb-1.5 block text-sm font-semibold text-ink"
                  >
                    Program &amp; year{" "}
                    <span className="text-xs font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="ss-program"
                    name="fi-text-program"
                    type="text"
                    disabled={submitting}
                    placeholder="e.g. BSIT — 3rd year"
                    className={inputClass}
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="ss-message"
                    className="mb-1.5 block text-sm font-semibold text-ink"
                  >
                    Your message
                  </label>
                  <textarea
                    id="ss-message"
                    name="fi-text-message"
                    rows={5}
                    required
                    disabled={submitting}
                    placeholder="Share your inquiry, concern, or suggestion in detail…"
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Honeypot */}
                <input
                  type="text"
                  name="_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                  style={{ display: "none" }}
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-green mt-1 w-full disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      Sending…
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : status === "success" ? (
                    <>
                      Sent to SCC!
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Send to the Council
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>

                {status === "success" && (
                  <p className="flex items-center justify-center gap-1.5 text-center text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Thanks! The SCC will review your submission.
                  </p>
                )}

                {status === "error" && (
                  <p className="flex items-center justify-center gap-1.5 text-center text-xs font-medium text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {error}
                  </p>
                )}

                <p className="text-center text-xs text-slate-500">
                  Submissions are received by the Student Coordinating Council
                  via the SCC forms backend.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
