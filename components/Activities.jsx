import {
  Gamepad2,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  Crown,
  Compass,
  Music,
  Gift,
  Apple,
  Ghost,
  Heart,
  MessagesSquare,
  Users,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { activities } from "@/data/activities";

// Map data icon names to imported lucide components.
const ICONS = {
  Gamepad2,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  Crown,
  Compass,
  Music,
  Gift,
  Apple,
  Ghost,
  Heart,
  MessagesSquare,
  Users,
};

export default function Activities() {
  return (
    <section id="activities" className="relative overflow-hidden bg-ink py-24 text-white">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-grid-fade [background-size:40px_40px] opacity-20" />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-feu-teal/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="container-px relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="pill bg-white/10 text-gold ring-1 ring-white/15">
            <CalendarDays className="h-3.5 w-3.5" />
            Annual Activities
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Programs that define the ATamaraw year
          </h2>
          <p className="mt-4 text-lg text-white/70">
            From esports and pageantry to outreach and wellness — a full calendar
            of signature events crafted for the FEU Alabang student body.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((event) => {
            const Icon = ICONS[event.icon] ?? Sparkles;
            return (
              <article
                key={event.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 hover:bg-white/[0.07]"
              >
                {/* Glow on hover */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gold/0 blur-2xl transition-all duration-300 group-hover:bg-gold/20" />

                <div className="flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-feu-green to-feu-teal text-gold ring-1 ring-white/10 transition group-hover:scale-105">
                    <Icon className="h-7 w-7" />
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-white/30 transition group-hover:text-gold" />
                </div>

                <h3 className="mt-5 text-lg font-bold">{event.name}</h3>
                <p className="text-sm font-medium text-gold/90">
                  {event.subtitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {event.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="pill bg-white/5 text-white/70 ring-1 ring-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
