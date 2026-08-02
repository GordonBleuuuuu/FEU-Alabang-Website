"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Folder,
  FileType2,
  Download,
  ExternalLink,
  ArrowRight,
  X,
} from "lucide-react";

// Full RSO forms library. Each entry links to its exact Google Drive
// subfolder (folders) or file (individual .docx documents).
const DRIVE_FORMS_URL =
  "https://drive.google.com/drive/folders/1cf-mOLMfRiGyJ3bvglDnQJojEukZUGrY";

const folder = (id) => `https://drive.google.com/drive/folders/${id}`;
const file = (id) => `https://drive.google.com/file/d/${id}/view`;

const FORM_LINKS = [
  { name: "Accreditation", href: folder("15LxtrC4P-ON5VPG6E4NUDBeDQbpVy_Vk"), type: "folder" },
  { name: "Activity Proposals", href: folder("1PC2L5rbiOpXVoptquIlEOXEMc2NQrglN"), type: "folder" },
  { name: "Candidacy Forms", href: folder("12Cxut3fdual46YXDnLuTHpFri0B4oejG"), type: "folder" },
  { name: "Officership (Appointment)", href: folder("1fAjP4qGkgqK1yKfIgOol_w_GGYtzfPRG"), type: "folder" },
  { name: "Monthly Report", href: folder("1-gJK8hrLrsi6Xslj9WtTGLyi8666EwvX"), type: "folder" },
  { name: "Term End Report", href: folder("1h4qmEZZwibug-lEugOBK76zMtQ9b9r_J"), type: "folder" },
  { name: "End of Year Report", href: folder("1wa406rN3L-Bxzg2hcaINWKX8uIXPKquU"), type: "folder" },
  { name: "Liquidation", href: folder("1JaKsFadFegzlCXf6mtRiSA4D3O_LwzsN"), type: "folder" },
  { name: "Leadership Award", href: folder("17Qz706gUhZIDRsGjv7-jAQJ8X7tEZsZv"), type: "folder" },
  { name: "Annual Students' Recognition", href: folder("18kMAeJccqQLNjewte2Bt3tKd7FwLlYWp"), type: "folder" },
  { name: "Other Forms", href: folder("1dOm4B78jQ8TY8S23H-zC9Uo0xBkERgqm"), type: "folder" },
  { name: "Endorsement Letter", href: file("1szZPP9fBvR4_A0aGuvXRFM0wCDw5wKou"), type: "file" },
  { name: "Official Attendance Sheet", href: file("1MxU_SdWeZILgyKVV4ty48_L7hY5aKHup"), type: "file" },
  { name: "Org / Club Code (Correspondence & Minutes)", href: file("1ry17eroDti_iA0q51zYbvBfdLdzuku_b"), type: "file" },
];

export default function RsoForms() {
  const [open, setOpen] = useState(false);

  // Lock body scroll and enable Escape-to-close while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Card — styled to match the other resource cards, opens the modal */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 hover:bg-white/[0.08]"
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold text-feu-moss shadow-gold transition group-hover:scale-105">
          <FileText className="h-7 w-7" />
        </span>
        <h3 className="mt-5 text-lg font-bold">Forms &amp; Requests</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          RSO forms and official SCC requests — accreditation, activity
          proposals, reports, and more.
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold">
          View RSO forms
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rso-forms-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative z-10 max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white text-ink shadow-2xl animate-fade-up">
            {/* Header — inline gradient so it always renders (never cache-stale) */}
            <div
              className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 text-white"
              style={{ background: "linear-gradient(135deg, #004B23, #0F5257)" }}
            >
              <div>
                <span className="pill bg-white/15 text-gold ring-1 ring-white/20">
                  <Folder className="h-3.5 w-3.5" />
                  For Recognized Student Organizations
                </span>
                <h3 id="rso-forms-title" className="mt-3 text-xl font-black">
                  RSO Forms &amp; Documents
                </h3>
                <p className="mt-1 text-sm text-white/75">
                  Pick a category to open and download it from the SCC forms drive.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable list */}
            <div className="max-h-[52vh] overflow-y-auto p-5">
              <div className="grid gap-2.5 sm:grid-cols-2">
                {FORM_LINKS.map((f) => {
                  const Icon = f.type === "folder" ? Folder : FileType2;
                  return (
                    <a
                      key={f.name}
                      href={f.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-feu-green/40 hover:bg-cloud"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-feu-green/10 text-feu-green transition group-hover:bg-feu-green group-hover:text-gold">
                          <Icon className="h-4 w-4" />
                        </span>
                        {f.name}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-feu-green" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-cloud px-5 py-4">
              <p className="text-xs text-slate-500">
                {FORM_LINKS.length} form categories · opens in Google Drive
              </p>
              <a
                href={DRIVE_FORMS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-green px-5 py-2.5 text-sm"
              >
                <Download className="h-4 w-4" />
                Open full drive
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
