"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { KeyRound, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-ink outline-none focus:border-feu-green focus:ring-2 focus:ring-feu-green/20";

export default function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const fields = new FormData(formElement);
    const currentPassword = String(fields.get("currentPassword") ?? "");
    const password = String(fields.get("password") ?? "");
    const confirmPassword = String(fields.get("confirmPassword") ?? "");

    setError(null);
    setSuccess(false);
    if (password !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }
    if (password === currentPassword) {
      setError("Choose a new password that is different from your current one.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        current_password: currentPassword,
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      formElement.reset();
      setSuccess(true);
    } catch {
      setError("Your password could not be changed right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-cloud px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-lg">
        <Link href="/admin" className="text-sm font-bold text-feu-green hover:underline">← Internal workspace</Link>
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9">
          <div className="flex items-center gap-3 text-feu-green"><KeyRound className="h-7 w-7" aria-hidden="true" /><h1 className="text-2xl font-black text-ink">Change password</h1></div>
          <p className="mt-3 text-sm leading-6 text-slate-600">Enter your current password, then choose a new one for your SCC or SADU account.</p>
          <form onSubmit={changePassword} className="mt-7 space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-bold text-ink">Current password</span><input name="currentPassword" type="password" autoComplete="current-password" required className={inputClass} /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-ink">New password</span><input name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-ink">Confirm new password</span><input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required className={inputClass} /></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {success && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Password changed. Use your new password the next time you sign in.</p>}
            <button type="submit" disabled={isSubmitting} className="btn-green w-full disabled:cursor-wait disabled:opacity-60"><LockKeyhole className="h-4 w-4" />{isSubmitting ? "Saving…" : "Save new password"}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
