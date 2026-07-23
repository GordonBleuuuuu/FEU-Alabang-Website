import { Target, Eye, Quote, Camera } from "lucide-react";

// Placeholder gallery tiles. Swap `src` in a real deployment; the gradient
// placeholders keep the layout intact with zero external assets.
const GALLERY = [
  { title: "General Assembly", span: "sm:col-span-2 sm:row-span-2", tone: "from-feu-green to-feu-teal" },
  { title: "Community Outreach", span: "", tone: "from-gold to-gold-deep" },
  { title: "Leadership Summit", span: "", tone: "from-feu-teal to-feu-moss" },
  { title: "ATamEx Expo", span: "sm:col-span-2", tone: "from-feu-moss to-feu-green" },
  { title: "Wellness Drive", span: "", tone: "from-gold-deep to-feu-green" },
  { title: "Cultural Night", span: "", tone: "from-feu-green to-gold-deep" },
];

export default function About() {
  return (
    <section id="about" className="relative bg-cloud py-24">
      <div className="container-px">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">About the Council</span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Serving the FEU Alabang community
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Founded in 2021, the Student Coordinating Council exists to represent,
            empower, and uplift every student through meaningful programs and
            genuine advocacy.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <article className="card-hover group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-feu-green/10 blur-2xl" />
            <div className="mb-5 inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-feu-green text-white shadow-glass">
                <Target className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-feu-green">Our Mission</h3>
            </div>
            <Quote className="mb-2 h-6 w-6 text-gold" />
            <p className="text-[1.02rem] leading-relaxed text-slate-700">
              The FEU Alabang Student Council&apos;s goal is to be the voice of the
              student body and serve the FEU Alabang community by organizing events
              and carrying out school activities that promote self-development,
              social awareness, school and community welfare.
            </p>
          </article>

          <article className="card-hover group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gold/20 blur-2xl" />
            <div className="mb-5 inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold text-feu-moss shadow-gold">
                <Eye className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-feu-green">Our Vision</h3>
            </div>
            <Quote className="mb-2 h-6 w-6 text-gold" />
            <p className="text-[1.02rem] leading-relaxed text-slate-700">
              The FEU Alabang Student Council aspires to be the epitome of student
              leadership excellence and governance that enriches the students&apos;
              experiences, and to be a completely autonomous and democratic
              representation of the FEU Alabang student body.
            </p>
          </article>
        </div>

        {/* Gallery */}
        <div className="mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="section-eyebrow">
                <Camera className="h-3.5 w-3.5" />
                Campus Life
              </span>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-ink sm:text-3xl">
                Moments from the community
              </h3>
            </div>
            <p className="max-w-sm text-sm text-slate-500">
              A glimpse of the events, drives, and celebrations that bring
              ATamaraws together throughout the year.
            </p>
          </div>

          <div className="grid auto-rows-[150px] grid-cols-2 gap-4 sm:auto-rows-[170px] sm:grid-cols-4">
            {GALLERY.map((item) => (
              <figure
                key={item.title}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.tone} ${item.span} shadow-card`}
              >
                <div className="absolute inset-0 bg-grid-fade [background-size:24px_24px] opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-white">
                  <span className="text-sm font-bold drop-shadow">
                    {item.title}
                  </span>
                  <Camera className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
                </figcaption>
                <div className="absolute inset-0 bg-white/0 transition group-hover:bg-white/10" />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
