import {
  Trophy,
  Users,
  HeartHandshake,
  Building2,
  Megaphone,
  Lightbulb,
  Handshake,
  HeartPulse,
  CalendarHeart,
  Award,
} from "lucide-react";
import { initiatives, accomplishments } from "@/data/activities";

const ICONS = {
  Trophy,
  Users,
  HeartHandshake,
  Building2,
  Megaphone,
  Lightbulb,
  Handshake,
  HeartPulse,
  CalendarHeart,
};

export default function Initiatives() {
  return (
    <section id="initiatives" className="relative bg-cloud py-24">
      <div className="container-px">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">
            <Award className="h-3.5 w-3.5" />
            Initiatives &amp; Accomplishments
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Impact you can measure
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Every program is rooted in the council&apos;s core pillars — advocacy,
            welfare, leadership, and culture — delivering real value to students.
          </p>
        </div>

        {/* Accomplishment stat band */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {accomplishments.map((item) => {
            const Icon = ICONS[item.icon] ?? Trophy;
            return (
              <div
                key={item.label}
                className="card-hover group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-feu-green/5 blur-2xl" />
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-feu-green/10 text-feu-green transition group-hover:bg-feu-green group-hover:text-gold">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="mt-5 text-4xl font-black text-feu-green">
                  {item.stat}
                </div>
                <div className="mt-1 text-sm font-bold text-ink">
                  {item.label}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Initiative pillars */}
        <div className="mt-16">
          <h3 className="text-center text-2xl font-black tracking-tight text-ink sm:text-left">
            Our core initiatives
          </h3>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {initiatives.map((item) => {
              const Icon = ICONS[item.icon] ?? Lightbulb;
              return (
                <article
                  key={item.title}
                  className="card-hover group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-feu-green/10 text-feu-green transition group-hover:bg-feu-green group-hover:text-gold">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h4 className="mt-5 text-lg font-bold text-ink">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                  <div className="mt-5 h-1 w-12 rounded-full bg-gradient-to-r from-gold to-gold-deep transition-all duration-300 group-hover:w-20" />
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
