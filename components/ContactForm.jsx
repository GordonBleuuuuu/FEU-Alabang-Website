"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

// -----------------------------------------------------------------------------
// Forminit form backend — submissions are emailed to ascc@feualabang.edu.ph
// (configured in the Forminit dashboard: Email Notifications).
//
// Public client-side mode: posts straight from the browser, no API key needed.
// Field names use Forminit's "block" convention (fi-sender-*, fi-text-*).
// -----------------------------------------------------------------------------
const FORMINIT_ENDPOINT =
  process.env.NEXT_PUBLIC_FORMINIT_ENDPOINT ||
  "https://forminit.com/f/ngl6g12r2nj";

const CONTACT_EMAIL = "ascc@feualabang.edu.ph";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot: bots fill the hidden "_hp" field; real users never do.
    if (formData.get("_hp")) {
      setStatus("success");
      form.reset();
      return;
    }
    formData.delete("_hp"); // don't forward the honeypot to Forminit

    setStatus("submitting");
    setError("");

    try {
      const res = await fetch(FORMINIT_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
        setTimeout(() => setStatus("idle"), 6000);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setError(
          data.message || "Something went wrong. Please try again in a moment."
        );
      }
    } catch {
      setStatus("error");
      setError("Network error — please try again, or email us directly.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-60";
  const submitting = status === "submitting";

  return (
    <form
      className="rounded-2xl border border-white/10 bg-feu-moss/40 p-6"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4">
        <div>
          <label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium text-white/80">
            Full name
          </label>
          <input
            id="cf-name"
            name="fi-sender-fullName"
            type="text"
            required
            disabled={submitting}
            placeholder="Juan Dela Cruz"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1.5 block text-sm font-medium text-white/80">
            Email
          </label>
          <input
            id="cf-email"
            name="fi-sender-email"
            type="email"
            required
            disabled={submitting}
            placeholder="you@feualabang.edu.ph"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="cf-message" className="mb-1.5 block text-sm font-medium text-white/80">
            Message
          </label>
          <textarea
            id="cf-message"
            name="fi-text-message"
            rows={4}
            required
            disabled={submitting}
            placeholder="How can the SCC help you?"
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Honeypot anti-spam field — visually hidden, ignored by humans */}
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
          className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              Sending…
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : status === "success" ? (
            <>
              Message sent!
              <CheckCircle2 className="h-4 w-4" />
            </>
          ) : (
            <>
              Send Message
              <Send className="h-4 w-4" />
            </>
          )}
        </button>

        {status === "success" && (
          <p className="flex items-center justify-center gap-1.5 text-center text-xs font-medium text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Thanks! Your message was sent to the SCC. We&apos;ll get back to you soon.
          </p>
        )}

        {status === "error" && (
          <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-xs font-medium text-red-300">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-gold">
              Email us directly
            </a>
          </p>
        )}

        {(status === "idle" || status === "submitting") && (
          <p className="text-center text-xs text-white/50">
            Your message goes straight to {CONTACT_EMAIL}.
          </p>
        )}
      </div>
    </form>
  );
}
