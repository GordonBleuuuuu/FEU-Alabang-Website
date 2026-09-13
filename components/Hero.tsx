import { ArrowRight, CalendarDays, ShieldCheck, Sparkles } from "lucide-react";
import HeroSlideshow from "./HeroSlideshow";
import Logo from "./Logo";

export default function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden bg-feu-moss text-white">
      <HeroSlideshow />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(10,61,31,0.97)_0%,rgba(0,75,35,0.91)_48%,rgba(15,82,87,0.84)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-grid-fade [background-size:44px_44px] opacity-25" />
      <div className="absolute inset-0 -z-10 bg-radial-gold" />
      <div className="pointer-events-none absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-gold-default/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 -z-10 h-96 w-96 rounded-full bg-feu-teal/45 blur-3xl" />

      <div className="container-px grid min-h-[calc(100svh-4.75rem)] gap-14 py-20 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:py-24">
        <div className="animate-fade-up">
          <span className="pill glass mb-6 text-gold-default">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Empowered · United · Brave
          </span>

          <h1 className="max-w-4xl text-balance text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            The Voice and Vision of the{" "}
            <span className="text-gradient-gold">FEU Alabang</span> Student Body
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
            Discover RSO activities, campus programs, and student-led initiatives in one
            official calendar—curated by the FEU Alabang Student Coordinating Council.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#events" className="btn-gold">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Browse Events
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="#about" className="btn-ghost">
              Meet the Council
            </a>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 text-sm text-white/65">
            <ShieldCheck className="h-4 w-4 text-gold-default" aria-hidden="true" />
            Official event information from SCC and SADU
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:120ms] lg:max-w-lg">
          <div className="absolute inset-8 rounded-full bg-gold-default/20 blur-3xl" />
          <div className="glass relative rounded-[2.25rem] p-6 shadow-glass sm:p-10">
            <div className="absolute -right-3 -top-3 rounded-full bg-gold-default px-4 py-2 text-xs font-black uppercase tracking-wider text-feu-moss shadow-gold">
              Events Hub
            </div>

            <div className="flex min-h-[22rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/25 bg-feu-moss/35 p-8 text-center">
              <div className="animate-float rounded-[2rem] bg-white/10 p-7 ring-1 ring-white/20 motion-reduce:animate-none">
                <Logo className="h-32 w-32 sm:h-40 sm:w-40" priority />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-gold-default">
                Animated FEU Crest
              </p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-white/60">
                Replace this crest container with a Lottie or motion asset without changing
                the hero layout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
