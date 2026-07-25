"use client";

import { useState } from "react";
import { Send, Mail } from "lucide-react";

// The contact form opens the visitor's email app with a message pre-addressed
// to the SCC. No backend, no third-party service, no keys required.
const CONTACT_EMAIL = "ascc@feualabang.edu.ph";

export default function ContactForm() {
  const [opened, setOpened] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") || "").toString().trim();
    const email = (fd.get("email") || "").toString().trim();
    const message = (fd.get("message") || "").toString().trim();

    const subject = `Website inquiry from ${name || "a student"}`;
    const body =
      `Name: ${name}\n` +
      `Email: ${email}\n\n` +
      `${message}\n`;

    // Open the visitor's default email client with everything pre-filled.
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    setOpened(true);
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
          Send Message
          <Send className="h-4 w-4" />
        </button>

        {opened && (
          <p className="text-center text-xs text-white/60">
            Your email app should have opened with a message ready to send. If it
            didn&apos;t,{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-gold underline"
            >
              email us directly
            </a>
            .
          </p>
        )}

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-white/50">
          <Mail className="h-3.5 w-3.5" />
          Messages go to {CONTACT_EMAIL}
        </p>
      </div>
    </form>
  );
}
