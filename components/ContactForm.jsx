"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo only — wire this up to your preferred email/form service
    // (e.g. Formspree, Resend, or a Next.js route handler).
    setSent(true);
    e.currentTarget.reset();
    setTimeout(() => setSent(false), 4000);
  };

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30";

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
            name="name"
            type="text"
            required
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
            name="email"
            type="email"
            required
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
            name="message"
            rows={4}
            required
            placeholder="How can the SCC help you?"
            className={`${inputClass} resize-none`}
          />
        </div>

        <button type="submit" className="btn-gold w-full">
          {sent ? (
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
        <p className="text-center text-xs text-white/50">
          Demo form — connect it to your preferred email or form service.
        </p>
      </div>
    </form>
  );
}
