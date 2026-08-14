import { Target, Eye, Quote, Camera, History, Milestone } from "lucide-react";

// Gallery tiles. Add `src: "/gallery/file.jpg"` to any tile to show a real
// photo; tiles without `src` render the gradient placeholder (tone).
const GALLERY = [
  { title: "General Assembly", span: "sm:col-span-2 sm:row-span-2", tone: "from-feu-green to-feu-teal" },
  { title: "Community Outreach", span: "", tone: "from-gold to-gold-deep" },
  { title: "Year End Leadership Training Seminar", span: "", tone: "from-feu-teal to-feu-moss" },
  { title: "ATam Esports Expo", span: "sm:col-span-2", tone: "from-feu-moss to-feu-green", src: "/gallery/atam-esports-expo.jpg" },
  { title: "ATamforJuan", span: "", tone: "from-gold-deep to-feu-green", src: "/gallery/atamforjuan.jpg" },
  { title: "Annual Student Recognition", span: "", tone: "from-feu-green to-gold-deep", src: "/gallery/annual-student-recognition.jpg" },
  { title: "ATamOneJam", span: "sm:col-span-2", tone: "from-feu-teal to-gold-deep", src: "/gallery/atamonejam.jpg" },
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

        {/* Our History */}
        <div className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow">
              <History className="h-3.5 w-3.5" />
              Our History
            </span>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-ink sm:text-3xl">
              Empowered, united, and brave from the start
            </h3>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <div className="grid gap-6 sm:grid-cols-2 sm:items-stretch">
              {/* 2021 — Founding */}
              <article className="card-hover relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-feu-green text-gold shadow-glass">
                    <Milestone className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-feu-teal">
                      The Founding
                    </div>
                    <div className="text-2xl font-black text-feu-green">2021</div>
                  </div>
                </div>
                <p className="text-[0.98rem] leading-relaxed text-slate-700">
                  Amid the challenges of the pandemic, the Student Coordinating
                  Council at FEU Alabang was founded with a clear mission: to
                  empower, unite, and encourage bravery, especially during trying
                  times. Recognizing the pressing need for a unified voice,{" "}
                  <span className="font-semibold text-feu-green">
                    Marianne Nicole Zulueta
                  </span>
                  , the founding president, worked tirelessly with the rest of
                  the council to establish a platform where students could
                  express their concerns and influence decision-making. Despite
                  the hurdles of remote communication, the council&apos;s
                  dedication fostered a culture of camaraderie and support,
                  creating a beacon of hope for the student body.
                </p>
              </article>

              {/* 2022 — Return to campus */}
              <article className="card-hover relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold text-feu-moss shadow-gold">
                    <Milestone className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-feu-teal">
                      Return to Campus
                    </div>
                    <div className="text-2xl font-black text-feu-green">2022</div>
                  </div>
                </div>
                <p className="text-[0.98rem] leading-relaxed text-slate-700">
                  When face-to-face classes resumed in 2022, the mantle was
                  passed to{" "}
                  <span className="font-semibold text-feu-green">
                    Alejandro Marcus Cu
                  </span>
                  , reintroducing the council to the rest of the student body as
                  a morale-centered and open-armed figure. Together with his
                  team, Alejandro reinforced the initial initiatives, ensuring
                  that student representation remained a priority and that their
                  voices were heard in every facet of campus life. Through their
                  unwavering commitment, the council continued to empower and
                  unite students, leaving a lasting impact on the FEU Alabang
                  community.
                </p>
              </article>
            </div>

            {/* Rally cry */}
            <blockquote
              className="relative mt-10 overflow-hidden rounded-3xl p-8 text-center text-white shadow-glass"
              style={{ background: "linear-gradient(135deg, #004B23, #0F5257)" }}
            >
              <Quote className="mx-auto h-6 w-6 text-gold" />
              <p className="mt-4 text-lg font-black leading-snug sm:text-xl">
                &ldquo;We are empowered! United and brave! We are the ATams!
                1&hellip; 2&hellip; 3&hellip; ATams!&rdquo;
              </p>
            </blockquote>
          </div>
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
                {/* Real photo if provided, otherwise the gradient tone shows through */}
                {item.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full scale-105 object-cover transition duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-grid-fade [background-size:24px_24px] opacity-30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
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
