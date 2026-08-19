import {
  ArrowRight,
  Users,
  Mail,
  Sparkles,
  Rocket,
} from "lucide-react";
import Logo from "./Logo";
import HeroSlideshow from "./HeroSlideshow";
import HeroStats from "./HeroStats";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-feu-moss text-white"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-feu-moss" />
      {/* Photo slideshow (silhouette behind the headline) */}
      <HeroSlideshow />
      {/* Green wash — makes the photos read as a silhouette + keeps text legible.
          Inline gradient so it always renders (never cache-stale). */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgba(10,61,31,0.94) 0%, rgba(0,75,35,0.88) 45%, rgba(15,82,87,0.82) 100%)",
        }}
      />
      <div className="absolute inset-0 bg-grid-fade [background-size:44px_44px] opacity-30" />
      <div className="absolute inset-0 bg-radial-gold" />
      {/* Fade into the section below */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-feu-moss to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-feu-teal/40 blur-3xl" />

      <div className="container-px relative grid gap-14 pb-24 pt-36 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-32 lg:pt-40">
        {/* Copy */}
        <div className="animate-fade-up">
          <span className="pill glass mb-6 text-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Empowered · United · Brave
          </span>

          <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            The Voice and Vision of the{" "}
            <span className="text-gradient-gold">FEU Alabang</span> Student Body
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            The official Student Coordinating Council of FEU Alabang — organizing
            events and championing initiatives that promote self-development,
            social awareness, and community welfare for every ATamaraw.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#initiatives" className="btn-gold">
              <Rocket className="h-4 w-4" />
              Explore Initiatives
            </a>
            <a href="#leadership" className="btn-ghost">
              <Users className="h-4 w-4" />
              View Leadership
            </a>
            <a href="#resources" className="btn-ghost">
              <Mail className="h-4 w-4" />
              Contact SCC
            </a>
          </div>

          {/* Stats — animated counter (client component) */}
          <HeroStats />
        </div>

        {/* Visual */}
        <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:120ms] lg:max-w-none">
          <div className="relative rounded-[2rem] border border-white/15 bg-white/5 p-8 shadow-glass backdrop-blur-xl">
            <div className="absolute -right-4 -top-4 rounded-2xl bg-gold px-4 py-2 text-xs font-bold text-feu-moss shadow-gold">
              EST. 2021
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="animate-float rounded-3xl bg-white/10 p-6 ring-1 ring-white/20">
                <Logo className="h-28 w-28" priority />
              </div>
              <h2 className="mt-6 text-xl font-bold">
                Student Coordinating Council
              </h2>
              <p className="text-sm text-gold">FEU Alabang</p>

              <div className="mt-6 h-px w-full shimmer-line animate-shimmer" />

              <div className="mt-6 grid w-full grid-cols-2 gap-3 text-left">
                {[
                  "Leadership",
                  "Advocacy",
                  "Community",
                  "Wellness",
                ].map((tag) => (
                  <div
                    key={tag}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold"
                  >
                    <span className="text-gold">◆</span> {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="relative">
        <svg
          className="block h-16 w-full text-cloud sm:h-24"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M0,64L60,58.7C120,53,240,43,360,48C480,53,600,75,720,80C840,85,960,75,1080,64C1200,53,1320,43,1380,37.3L1440,32L1440,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
}
