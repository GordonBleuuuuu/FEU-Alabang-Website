"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, LockKeyhole } from "lucide-react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [isRecoverySession, setIsRecoverySession] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // A normal signed-in session must use the workspace form, which asks for
      // the current password. Only an accepted recovery link opens this form.
      if (event === "PASSWORD_RECOVERY") setIsRecoverySession(Boolean(session));
      if (event === "INITIAL_SESSION") setIsRecoverySession((current) => current === true ? true : false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    // Do not show a successful setup message until the new credential has
    // actually been accepted by Auth. This prevents a misleading success UI
    // if a browser session or recovery token has gone stale.
    const email = updateData.user.email;
    if (!email) {
      setError("Your password could not be verified. Please request a new recovery link.");
      setIsSubmitting(false);
      return;
    }

    const { error: verificationError } = await supabase.auth.signInWithPassword({ email, password });
    if (verificationError) setError("Your password was not accepted. Please request a new recovery link.");
    else setSuccess(true);
    setIsSubmitting(false);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-feu-moss px-5 py-10 text-white">
      <section className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-7 shadow-glass backdrop-blur-2xl sm:p-9">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Logo className="h-11 w-11" priority />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gold-default">Internal workspace</p>
            <h1 className="mt-1 text-2xl font-black">Set your password</h1>
          </div>
        </div>

        {isRecoverySession === null && <p className="mt-7 text-sm text-white/65">Verifying your secure link…</p>}

        {isRecoverySession === false && (
          <div className="mt-7 rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-100">
            This reset link is invalid or has expired. Request a new link from the sign-in page.
            <Link href="/login" className="mt-3 block font-bold text-gold-default hover:text-gold-light">Go to sign in →</Link>
          </div>
        )}

        {isRecoverySession && !success && (
          <form onSubmit={updatePassword} className="mt-7 space-y-5">
            <p className="text-sm leading-6 text-white/65">Choose a password with at least eight characters, then use it to sign in to the SCC or SADU workspace.</p>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">New password</span>
              <input name="password" type="password" autoComplete="new-password" required minLength={8} className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-gold-default focus:ring-2 focus:ring-gold-default/25" placeholder="At least 8 characters" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Confirm password</span>
              <input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-gold-default focus:ring-2 focus:ring-gold-default/25" placeholder="Repeat your password" />
            </label>
            {error && <p role="alert" className="rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="btn-gold w-full disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? <LockKeyhole className="h-4 w-4 animate-pulse" /> : <KeyRound className="h-4 w-4" />}
              {isSubmitting ? "Saving password…" : "Save password"}
            </button>
          </form>
        )}

        {success && (
          <div className="mt-7 rounded-xl border border-emerald-200/25 bg-emerald-300/10 px-4 py-4 text-sm leading-6 text-emerald-50">
            Password saved. You can now sign in to the SCC or SADU workspace.
            <Link href="/login" className="mt-3 block font-bold text-gold-default hover:text-gold-light">Go to sign in →</Link>
          </div>
        )}

        <Link href="/" className="mt-6 block text-center text-sm font-semibold text-white/60 hover:text-white">Return to the public calendar</Link>
      </section>
    </main>
  );
}
