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
  Mail,
  Bell,
  Info,
} from "lucide-react";
import {
  APPLICATIONS_OPEN,
  APPLICATIONS_OPEN_DATE,
  committees,
} from "@/data/committees";

// Both the application form and the notify-me signup post to the same
// Forminit endpoint used by the rest of the site. Category blocks let ASCC
// triage in the Forminit dashboard.
const FORMINIT_ENDPOINT =
  process.env.NEXT_PUBLIC_FORMINIT_ENDPOINT ||
  "https://forminit.com/f/ngl6g12r2nj";

// ---------------- Notify-me signup (shown while APPLICATIONS_OPEN is false)
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
    fd.set("fi-sender-fullName", fd.get("fi-sender-fullName") || "Notify-me signup");
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
    <form onSubmit={handleSubmit} className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
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
        <p className="sm:col-span-2 flex items-center gap-1.5 text-xs font-medium text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          You&apos;re on the list — we&apos;ll email you the moment applications open.
        </p>
      )}
      {status === "error" && (
        <p className="sm:col-span-2 flex items-center gap-1.5 text-xs font-medium text-red-300">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </form>
  );
}

// ---------------- Full application form (shown when APPLICATIONS_OPEN is true)
function ApplicationForm({ committees }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [committeeName, setCommitteeName] = useState(committees[0]?.name || "");

  const selectedCommittee = useMemo(
    () => committees.find((c) => c.name === committeeName),
    [committeeName, committees]
  );

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
    fd.set("fi-select-category", "Committee Application");
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
        setCommitteeName(committees[0]?.name || "");
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
  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-60";

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
        <div>
          <label htmlFor="ap-committee" className="mb-1.5 block text-sm font-medium text-white/85">
            Committee you&apos;re applying to
          </label>
          <select
            id="ap-committee"
            name="fi-select-committee"
            value={committeeName}
            onChange={(e) => setCommitteeName(e.target.value)}
            disabled={submitting}
            className={inputClass}
          >
            {committees.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ap-role" className="mb-1.5 block text-sm font-medium text-white/85">
            Preferred role
          </label>
          <select id="ap-role" name="fi-select-role" disabled={submitting || !selectedCommittee} className={inputClass}>
            {(selectedCommittee?.roles || []).map((r) => (
              <option key={r.name} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
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

        <input type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" style={{ display: "none" }} />

        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? (
              <>
                Submitting…
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : status === "success" ? (
              <>
                Application received!
                <CheckCircle2 className="h-4 w-4" />
              </>
            ) : (
              <>
                Submit application
                <Send className="h-4 w-4" />
              </>
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

// ---------------- Section
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
        <div className="mx-auto max-w-2xl text-center">
          <span className="pill glass text-gold">
            <ClipboardList className="h-3.5 w-3.5" />
            Join the Council
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

        {/* Coming-soon state */}
        {!APPLICATIONS_OPEN && (
          <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl sm:p-10">
            <div className="flex flex-col items-center text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold text-feu-moss shadow-gold">
                <Rocket className="h-7 w-7" />
              </span>
              <h3 className="mt-5 text-2xl font-black">
                {APPLICATIONS_OPEN_DATE
                  ? `Applications open ${APPLICATIONS_OPEN_DATE}`
                  : "Applications open soon"}
              </h3>
              <p className="mt-3 max-w-md text-white/70">
                Committee applications for the upcoming term are being
                finalized. Drop your details and we&apos;ll email you the moment
                the form goes live.
              </p>

              <div className="w-full max-w-md">
                <NotifyMeForm />
              </div>
            </div>
          </div>
        )}

        {/* Open state — committees grid + application form */}
        {APPLICATIONS_OPEN && (
          <>
            {committees.length > 0 && (
              <div className="mt-14">
                <div className="mb-6 flex items-center gap-3">
                  <Users className="h-5 w-5 text-gold" />
                  <h3 className="text-xl font-black">What you can join</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {committees.map((c) => (
                    <article
                      key={c.name}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition hover:border-gold/40 hover:bg-white/[0.08]"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-gold" />
                        <h4 className="font-bold">{c.name}</h4>
                      </div>
                      {c.description ? (
                        <p className="mt-1.5 text-sm text-white/70">
                          {c.description}
                        </p>
                      ) : null}
                      {c.roles && c.roles.length > 0 ? (
                        <ul className="mt-3 space-y-2 border-t border-white/10 pt-3">
                          {c.roles.map((r) => (
                            <li key={r.name} className="text-sm">
                              <div className="font-semibold text-gold">
                                {r.name}
                              </div>
                              {r.description ? (
                                <div className="text-white/60">
                                  {r.description}
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12">
              <div className="mb-4 flex items-center gap-2 text-sm text-white/70">
                <Info className="h-4 w-4 text-gold" />
                Every field is reviewed. Take your time — this is your pitch.
              </div>
              {committees.length > 0 ? (
                <ApplicationForm committees={committees} />
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-white/70">
                  <Mail className="mx-auto mb-3 h-6 w-6 text-gold" />
                  Committee list is being finalized. Please check back soon.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
