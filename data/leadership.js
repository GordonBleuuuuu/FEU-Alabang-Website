// =============================================================================
//  LEADERSHIP DATA — FEU Alabang Student Coordinating Council
// -----------------------------------------------------------------------------
//  NOTE: Officer names below are PLACEHOLDERS to keep the app runnable out of
//  the box. Replace `name`, `socials`, and (optionally) `photo` with the real
//  roster for each batch. The structure is intentionally simple to edit.
//
//  Each officer:
//    {
//      name, position, department, badge,
//      photo: "/officers/Name.jpg",
//      socials: { facebook, instagram, linkedin, email },
//      bio: "Short paragraph about the officer.",
//      contributions: ["Led X initiative", "Organized Y event"],
//      experience: ["President — Club (SY 2024-2025)", "Officer — Society"],
//      achievements: ["Outstanding Leader 2024", "Dean's Lister"],
//    }
//  Clicking an officer card opens a profile modal. `bio`, `contributions`,
//  `experience`, and `achievements` are optional — leave them empty and the
//  modal hides empty sections automatically.
//  `badge` groups officers into color-coded categories (see BADGE_STYLES in the
//  Leadership component).
// =============================================================================

const makeOfficers = (roster) =>
  roster.map((o) => ({
    department: "",
    socials: {},
    bio: "",
    contributions: [],
    experience: [],
    achievements: [],
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
      { name: "Yensid Ritchy Mimay", position: "President", badge: "Executive", photo: "/officers/Yensid.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Vonn Kendrick C. Pedrena", position: "Vice President — Internal", badge: "Executive", photo: "/officers/Kendrick.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Mariel Daniella P. Riquero", position: "Vice President — External", badge: "Executive", photo: "/officers/Mariel.jpg", socials: { facebook: "#", instagram: "#" } },
      {
        name: "Justin Emmanuel J. Janda",
        position: "Secretary",
        badge: "Secretariat",
        photo: "/officers/Justin.jpg",
        department: "BS Computer Science with Specialization in Software Engineering — 3rd Year",
        socials: { facebook: "#", instagram: "#" },
        bio: "I envision myself as a dedicated and organized leader, a leader who emphasizes the importance of accountability, communication, and teamwork. I aim to help create an organization that fosters a safe space where students can freely be themselves while remaining coordinated, transparent, and connected.",
        experience: [
          "President — ACMFEUASC (S.Y. 2025 – 2026)",
          "Communications Junior Officer — ACMFEUASC (S.Y. 2024 – 2025)",
          "Programs Committee — FEU Alabang Freshmen Society (S.Y. 2024 – 2025)",
          "Secretariat Head — CS Technofair 2026",
        ],
      },
      { name: "Gabriel Montales", position: "Assistant Secretary", badge: "Secretariat", photo: "/officers/Gab.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Allan Matthew C. Callao", position: "Treasurer", badge: "Finance", photo: "/officers/Matthew.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Nathalie H. Colico", position: "Auditor", badge: "Finance", photo: "/officers/Thalia.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Nathanael Gerard V. Ragasa", position: "Public Relations Officer", badge: "Communications", photo: "/officers/Nigel.jpg", socials: { facebook: "#", instagram: "#" } },
    ]),
  },
  {
    id: "batch-5",
    label: "Batch 5",
    sy: "S.Y. 2025 – 2026",
    active: false,
    tagline: "Sustaining the momentum of student-led excellence.",
    officers: makeOfficers([
      { name: "Nathanael V. Ragasa", position: "President", badge: "Executive", photo: "/officers/Nigel.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Yensid Ritchy Mimay", position: "Vice President — Internal", badge: "Executive", photo: "/officers/Yensid.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Vonn Kendrick C. Pedrena", position: "Vice President — External", badge: "Executive", photo: "/officers/Kendrick.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Gabriel Montales", position: "Secretary", badge: "Secretariat", photo: "/officers/Gab.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Nathalie H. Colico", position: "Treasurer", badge: "Finance", photo: "/officers/Thalia.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Chis V. Adea", position: "Public Relations Officer", badge: "Communications", photo: "/officers/Chis.jpg", socials: { facebook: "#", instagram: "#" } },
    ]),
  },
  {
    id: "batch-4",
    label: "Batch 4",
    sy: "S.Y. 2024 – 2025",
    active: false,
    tagline: "Building bridges across the ATamaraw community.",
    officers: makeOfficers([
      { name: "Aster Joy Peralta", position: "President", badge: "Executive", photo: "/officers/Aster.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Trisha Grace Edang", position: "Vice President", badge: "Executive", photo: "/officers/Trisha.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Martin Matthew Ambayec", position: "Secretary", badge: "Secretariat", photo: "/officers/Martin.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Zeon Bretaña", position: "Treasurer", badge: "Finance", photo: "/officers/Zeon.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Vonn Kendrick C. Pedrena", position: "Public Relations Officer", badge: "Communications", photo: "/officers/Kendrick.jpg", socials: { facebook: "#", instagram: "#" } },
    ]),
  },
  {
    id: "batch-3",
    label: "Batch 3",
    sy: "S.Y. 2023 – 2024",
    active: false,
    tagline: "Expanding programs and deepening community impact.",
    officers: makeOfficers([
      { name: "Alejandro Marcus Cu", position: "President", badge: "Executive", photo: "/officers/Ali.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Rheigne Ily Lasam", position: "Vice President — External Affairs", badge: "Executive", photo: "/officers/Ily.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Aster Joy Peralta", position: "Vice President — Internal Affairs", badge: "Executive", photo: "/officers/Aster.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Aubrey Diane Gatuatan", position: "Executive Secretary", badge: "Secretariat", photo: "/officers/Aubrey.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Martin Matthew Ambayec", position: "Treasurer", badge: "Finance", photo: "/officers/Martin.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Mervin Kim Sumagui", position: "Public Relations Officer", badge: "Communications", photo: "/officers/Mervin.jpg", socials: { facebook: "#", instagram: "#" } },
    ]),
  },
  {
    id: "batch-2",
    label: "Batch 2",
    sy: "S.Y. 2022 – 2023",
    active: false,
    tagline: "Growing the council's reach and traditions.",
    officers: makeOfficers([
      { name: "Alejandro Marcus Cu", position: "President", badge: "Executive", photo: "/officers/Ali.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Abigail Darlene Mitra", position: "Vice President — Internal Affairs", badge: "Executive", photo: "/officers/Abigail.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Kenshin Ives Torrente", position: "Vice President — External Affairs", badge: "Executive", photo: "/officers/Kenshin.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Aster Joy Peralta", position: "Executive Secretary", badge: "Secretariat", photo: "/officers/Aster.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Marijo Cayo", position: "Assistant Secretary", badge: "Secretariat", photo: "/officers/Marijo.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Rheigne Ily Lasam", position: "Treasurer", badge: "Finance", photo: "/officers/Ily.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Kyle Jierom Lacson", position: "Auditor", badge: "Finance", photo: "/officers/Kyle.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Sean Laurence Perez", position: "Public Relations Officer", badge: "Communications", photo: "/officers/Sean.jpg", socials: { facebook: "#", instagram: "#" } },
    ]),
  },
  {
    id: "batch-1",
    label: "Batch 1",
    sy: "S.Y. 2021 – 2022",
    active: false,
    tagline: "The founding council — where it all began. (Est. 2021)",
    officers: makeOfficers([
      { name: "Marianne Nicole Zulueta", position: "President", badge: "Executive", photo: "/officers/Marianne.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Veronica Jane Martinez", position: "Vice President — Internal Affairs", badge: "Executive", photo: "/officers/Veronica.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Edward Ryan Ong", position: "Vice President — External Affairs", badge: "Executive", photo: "/officers/Edward.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Beatrice Nicole Icban", position: "Secretary", badge: "Secretariat", socials: { facebook: "#", instagram: "#" } },
      { name: "Aaron Daniel Mitra", position: "Treasurer", badge: "Finance", socials: { facebook: "#", instagram: "#" } },
      { name: "Abigail Darlene Mitra", position: "Auditor", badge: "Finance", photo: "/officers/Abigail.jpg", socials: { facebook: "#", instagram: "#" } },
      { name: "Kenshin Ives Torrente", position: "Public Relations Officer", badge: "Communications", photo: "/officers/Kenshin.jpg", socials: { facebook: "#", instagram: "#" } },
    ]),
  },
];
