"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, LogIn } from "lucide-react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Authentication is not configured. Please contact the site administrator.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-feu-moss px-5 py-10 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-7 shadow-glass backdrop-blur-2xl sm:p-9">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Logo className="h-11 w-11" priority />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gold-default">Internal workspace</p>
            <h1 className="mt-1 text-2xl font-black">Executive sign in</h1>
          </div>
        </div>

        <p className="mt-7 text-sm leading-6 text-white/65">
          Access is limited to authorized SCC Executive and SADU accounts.
        </p>

        <form onSubmit={signIn} className="mt-7 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold">FEU email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-gold-default focus:ring-2 focus:ring-gold-default/25"
              placeholder="name@feualabang.edu.ph"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-gold-default focus:ring-2 focus:ring-gold-default/25"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-gold w-full disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? <LockKeyhole className="h-4 w-4 animate-pulse" /> : <LogIn className="h-4 w-4" />}
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <Link href="/" className="mt-6 block text-center text-sm font-semibold text-white/60 hover:text-white">
          Return to the public calendar
        </Link>
      </div>
    </main>
  );
}
