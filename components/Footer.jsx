import { Mail, Facebook, Instagram, ArrowUp } from "lucide-react";
import Logo from "./Logo";

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Leadership", href: "#leadership" },
  { label: "Activities", href: "#activities" },
  { label: "Initiatives", href: "#initiatives" },
  { label: "Resources", href: "#resources" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-ink text-white">
      <div className="container-px py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <Logo className="h-10 w-10" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  FEU Alabang
                </div>
                <div className="text-base font-bold">
                  Student Coordinating Council
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              The voice and vision of the FEU Alabang student body. Empowered,
              united, and brave — serving the community since 2021.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="mailto:ascc@feualabang.edu.ph"
                aria-label="Email the SCC"
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 transition hover:bg-gold hover:text-feu-moss"
              >
                <Mail className="h-5 w-5" />
              </a>
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

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-gold">
              Quick Links
            </h4>
            <ul className="mt-5 space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-gold">
              Contact
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-white/60">
              <li>
                <a
                  href="mailto:ascc@feualabang.edu.ph"
                  className="transition hover:text-gold"
                >
                  ascc@feualabang.edu.ph
                </a>
              </li>
              <li>FEU Alabang, Corporate Woods</li>
              <li>Muntinlupa City, Philippines</li>
            </ul>
            <a
              href="#home"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-gold hover:text-feu-moss"
            >
              <ArrowUp className="h-4 w-4" />
              Back to top
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center text-xs text-white/50 sm:flex-row sm:text-left">
          <p>
            © {year} FEU Alabang Student Coordinating Council. All rights
            reserved.
          </p>
          <p>
            Empowered · United · Brave —{" "}
            <span className="text-gold">Est. 2021</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
