// =============================================================================
//  LEADERSHIP DATA — FEU Alabang Student Coordinating Council
// -----------------------------------------------------------------------------
//  NOTE: Officer names below are PLACEHOLDERS to keep the app runnable out of
//  the box. Replace `name`, `socials`, and (optionally) `photo` with the real
//  roster for each batch. The structure is intentionally simple to edit.
//
//  Each officer:
//    { name, position, department, badge, socials: { facebook, instagram, linkedin, email } }
//  `badge` groups officers into color-coded categories (see BADGE_STYLES in the
//  Leadership component).
// =============================================================================

const makeOfficers = (roster) =>
  roster.map((o) => ({
    department: "",
    socials: {},
    ...o,
  }));

export const batches = [
  {
    id: "batch-6",
    label: "Batch 6",
    sy: "S.Y. 2026 – 2027",
    active: true,
    tagline: "The current active term — leading FEU Alabang forward.",
    officers: makeOfficers([
      { name: "Officer Name", position: "President", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Vice President — Internal", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Vice President — External", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Secretary", badge: "Secretariat", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Assistant Secretary", badge: "Secretariat", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Treasurer", badge: "Finance", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Auditor", badge: "Finance", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Public Relations Officer", badge: "Communications", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Business Manager", badge: "Operations", socials: { facebook: "#", instagram: "#" } },
    ]),
  },
  {
    id: "batch-5",
    label: "Batch 5",
    sy: "S.Y. 2025 – 2026",
    active: false,
    tagline: "Sustaining the momentum of student-led excellence.",
    officers: makeOfficers([
      { name: "Officer Name", position: "President", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Vice President — Internal", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Vice President — External", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Secretary", badge: "Secretariat", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Assistant Secretary", badge: "Secretariat", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Treasurer", badge: "Finance", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Auditor", badge: "Finance", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Public Relations Officer", badge: "Communications", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Business Manager", badge: "Operations", socials: { facebook: "#", instagram: "#" } },
    ]),
  },
  {
    id: "batch-4",
    label: "Batch 4",
    sy: "S.Y. 2024 – 2025",
    active: false,
    tagline: "Building bridges across the ATamaraw community.",
    officers: makeOfficers([
      { name: "Officer Name", position: "President", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Vice President — Internal", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Vice President — External", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Secretary", badge: "Secretariat", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Treasurer", badge: "Finance", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Auditor", badge: "Finance", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Public Relations Officer", badge: "Communications", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Business Manager", badge: "Operations", socials: { facebook: "#", instagram: "#" } },
    ]),
  },
  {
    id: "batch-3",
    label: "Batch 3",
    sy: "S.Y. 2023 – 2024",
    active: false,
    tagline: "Expanding programs and deepening community impact.",
    officers: makeOfficers([
      { name: "Officer Name", position: "President", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Vice President — Internal", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Vice President — External", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Secretary", badge: "Secretariat", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Treasurer", badge: "Finance", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Auditor", badge: "Finance", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Public Relations Officer", badge: "Communications", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Business Manager", badge: "Operations", socials: { facebook: "#", instagram: "#" } },
    ]),
  },
  {
    id: "batch-2",
    label: "Batch 2",
    sy: "S.Y. 2022 – 2023",
    active: false,
    tagline: "Growing the council's reach and traditions.",
    officers: makeOfficers([
      { name: "Officer Name", position: "President", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Vice President — Internal", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Vice President — External", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Secretary", badge: "Secretariat", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Treasurer", badge: "Finance", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Auditor", badge: "Finance", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Public Relations Officer", badge: "Communications", socials: { facebook: "#", instagram: "#" } },
    ]),
  },
  {
    id: "batch-1",
    label: "Batch 1",
    sy: "S.Y. 2021 – 2022",
    active: false,
    tagline: "The founding council — where it all began. (Est. 2021)",
    officers: makeOfficers([
      { name: "Officer Name", position: "President", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Vice President — Internal", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Vice President — External", badge: "Executive", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Secretary", badge: "Secretariat", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Treasurer", badge: "Finance", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Auditor", badge: "Finance", socials: { facebook: "#", instagram: "#" } },
      { name: "Officer Name", position: "Public Relations Officer", badge: "Communications", socials: { facebook: "#", instagram: "#" } },
    ]),
  },
];
