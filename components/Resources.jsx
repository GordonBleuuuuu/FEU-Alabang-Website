import {
  FileText,
  CalendarClock,
  HelpCircle,
  BookOpenCheck,
  Mail,
  MapPin,
  ArrowRight,
  Facebook,
  Instagram,
  FolderOpen,
  Download,
  ExternalLink,
} from "lucide-react";
import ContactForm from "./ContactForm";

// Google Drive folder holding all RSO (Recognized Student Organization) forms.
const DRIVE_FORMS_URL =
  "https://drive.google.com/drive/folders/1cf-mOLMfRiGyJ3bvglDnQJojEukZUGrY";

const RESOURCES = [
  {
    icon: FileText,
    title: "Forms & Requests",
    description:
      "RSO forms and official SCC requests — accreditation, activity proposals, reports, and more.",
    action: "Open forms drive",
    href: DRIVE_FORMS_URL,
    external: true,
  },
  {
    icon: CalendarClock,
    title: "Event Calendar",
    description:
      "Stay updated on upcoming activities, deadlines, and council announcements.",
    action: "View calendar",
    href: "#resources",
  },
  {
    icon: BookOpenCheck,
    title: "Student Handbook",
    description:
      "Reference university policies, guidelines, and student rights & responsibilities.",
    action: "Open handbook",
    href: "#resources",
  },
  {
    icon: HelpCircle,
    title: "Help & Support",
    description:
      "Reach the right committee for concerns, feedback, or assistance from the SCC.",
    action: "Get help",
    href: "#resources",
  },
];

// RSO document categories available in the Drive folder above.
const RSO_FORMS = [
  "Accreditation",
  "Activity Proposals",
  "Candidacy Forms",
  "Officership (Appointment)",
  "Monthly Report",
  "Term End Report",
  "End of Year Report",
  "Liquidation",
  "Leadership Award",
  "Annual Students' Recognition",
  "Endorsement Letter",
  "Official Attendance Sheet",
  "Org / Club Code (Correspondence & Minutes)",
  "Other Forms",
];

export default function Resources() {
  return (
    <section id="resources" className="relative overflow-hidden bg-feu-moss py-24 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-feu-moss via-feu-green to-feu-teal" />
      <div className="absolute inset-0 bg-grid-fade [background-size:40px_40px] opacity-25" />
      <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />

      <div className="container-px relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="pill glass text-gold">
            <BookOpenCheck className="h-3.5 w-3.5" />
            Resources
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Everything students need, in one place
          </h2>
          <p className="mt-4 text-lg text-white/75">
            Quick links, official forms, and direct lines to the council — built
            to make student life at FEU Alabang easier.
          </p>
        </div>

        {/* Resource cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {RESOURCES.map((r) => (
            <a
              key={r.title}
              href={r.href}
              target={r.external ? "_blank" : undefined}
              rel={r.external ? "noopener noreferrer" : undefined}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 hover:bg-white/[0.08]"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold text-feu-moss shadow-gold transition group-hover:scale-105">
                <r.icon className="h-7 w-7" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {r.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                {r.action}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>

        {/* RSO Forms & Documents */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl lg:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="pill bg-gold/15 text-gold ring-1 ring-gold/25">
                <FolderOpen className="h-3.5 w-3.5" />
                For Recognized Student Organizations
              </span>
              <h3 className="mt-3 text-2xl font-black">
                RSO Forms &amp; Documents
              </h3>
              <p className="mt-2 max-w-xl text-sm text-white/70">
                Every official form your organization needs — accreditation,
                activity proposals, reports, liquidation, and more. Click a
                category to open and download it from the SCC forms drive.
              </p>
            </div>
            <a
              href={DRIVE_FORMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold shrink-0"
            >
              <Download className="h-4 w-4" />
              Open Forms Drive
            </a>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RSO_FORMS.map((form) => (
              <a
                key={form}
                href={DRIVE_FORMS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:border-gold/40 hover:bg-white/10"
              >
                <span className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-gold" />
                  {form}
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/40 transition group-hover:text-gold" />
              </a>
            ))}
          </div>
        </div>

        {/* Contact panel */}
        <div className="mt-12 grid gap-6 rounded-3xl border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl lg:grid-cols-2 lg:p-10">
          <div>
            <h3 className="text-2xl font-black">Get in touch with the SCC</h3>
            <p className="mt-3 max-w-md text-white/75">
              Have a question, proposal, or concern? The Student Coordinating
              Council is here to listen and represent you.
            </p>

            <div className="mt-8 space-y-4">
              <a
                href="mailto:ascc@feualabang.edu.ph"
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-gold/40"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold text-feu-moss">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/60">
                    Email
                  </div>
                  <div className="font-semibold">ascc@feualabang.edu.ph</div>
                </div>
              </a>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-gold">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/60">
                    Location
                  </div>
                  <div className="font-semibold">
                    FEU Alabang, Corporate Woods, Muntinlupa City
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-sm text-white/60">Follow us:</span>
                <a
                  href="#resources"
                  aria-label="SCC on Facebook"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 transition hover:bg-gold hover:text-feu-moss"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#resources"
                  aria-label="SCC on Instagram"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 transition hover:bg-gold hover:text-feu-moss"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact form (client component) */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
