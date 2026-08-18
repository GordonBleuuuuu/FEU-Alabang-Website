// =============================================================================
//  COMMITTEE APPLICATIONS — FEU Alabang Student Coordinating Council
// -----------------------------------------------------------------------------
//  This one file drives the whole Apply section: whether it's open, when it
//  opens/closes, the process timeline, the committee list, and the FAQ.
//
//  QUICK CHECKLIST — items marked ⚠️ TODO need your real data before launch.
// =============================================================================

// ⚠️ TODO: flip to true on Aug 19, 2026 when Batch 1 applications go live.
// (After Batch 1 closes Aug 23, flip false again until Batch 2 opens Sept 24.)
export const APPLICATIONS_OPEN = false;

// Real dates are set — countdown is live and ticks to opensAt / closesAt below.
export const SHOW_COUNTDOWN = true;

// -----------------------------------------------------------------------------
// KEY DATES — used by the countdown timer, coming-soon banner, and timeline.
// ⚠️ TODO: replace these with your real cycle dates before launch.
// Use ISO strings so timezones stay correct. Times default to 23:59 PHT.
// -----------------------------------------------------------------------------
export const APPLICATION_CYCLE = {
  // Batch 1 window — the imminent one the countdown targets.
  opensAt: "2026-08-19T09:00:00+08:00",
  closesAt: "2026-08-23T23:59:00+08:00",
  // Screening + interview windows (Batch 1).
  screeningWindow: "August 29 – 31, 2026",
  interviewsWindow: "September 1 – 2, 2026",
  // Batch 2 window for late applicants.
  batch2Window: "September 24 – 28, 2026",
  // ⚠️ TODO: set the announcement date once final.
  announcementDate: "TBA",
  // Term the accepted applicants will serve.
  termLabel: "S.Y. 2026 – 2027",
};

// -----------------------------------------------------------------------------
// TIMELINE — the 4-step "Apply → Screen → Interview → Announce" strip.
// Feel free to add/remove steps; the UI adapts.
// -----------------------------------------------------------------------------
export const TIMELINE = [
  {
    step: "1",
    title: "Applications",
    date: "Batch 1: Aug 19 – 23  ·  Batch 2: Sept 24 – 28, 2026",
    description:
      "Submit your application in either the Batch 1 or Batch 2 window.",
  },
  {
    step: "2",
    title: "Screening",
    date: "August 29 – 31, 2026",
    description: "The SCC reviews every submission carefully.",
  },
  {
    step: "3",
    title: "Interviews",
    date: "September 1 – 2, 2026",
    description: "Shortlisted applicants are invited to a short interview.",
  },
  {
    step: "4",
    title: "Announcement",
    date: "TBA",
    description: "Accepted committee members are notified via email.",
  },
];

// -----------------------------------------------------------------------------
// COMMITTEES — ⚠️ TODO: replace with your real committees and roles.
// Each committee shows on the Apply section as a card. `hoursPerWeek` and
// `meetingCadence` power the "expectations" line so applicants self-select.
// -----------------------------------------------------------------------------
export const committees = [
  {
    name: "Programs Committee",
    description:
      "Handles every detail about the events of the organization — from proposal-making to implementation.",
    responsibilities: [
      "Handles every detail about the events of the organization — from proposal making to implementation.",
      "Initiates and prepares plans for the current and upcoming events / activities of the organization.",
    ],
    roles: [
      { name: "Member", description: "Joins the Programs team to plan, coordinate, and run SCC events end-to-end." },
    ],
  },
  {
    name: "Logistics Committee",
    description:
      "Makes SCC events happen on the ground — resources, venue, setup, and equipment.",
    responsibilities: [
      "Allocates resources such as equipment, materials, and personnel needed for events, ensuring everything is available and in order.",
      "Arranges venue set-up, signages, seating arrangements, and any necessary permits to ensure a smooth program.",
      "Manages transportation of equipment to and from the venue.",
      "Coordinates a precise time for ingress and egress of the venue for the event set-up.",
    ],
    roles: [
      { name: "Member", description: "Joins the Logistics team to handle setup, equipment, and on-site coordination for every SCC event." },
    ],
  },
  {
    name: "Secretariat Committee",
    description:
      "Keeps the paperwork, registration, and minutes running smoothly for every SCC activity.",
    responsibilities: [
      "Manages all paperwork (traditional and digital) for events / activities and internal purposes.",
      "Handles the registration process in any event / activity.",
      "Diligently attends all meetings and takes down minutes.",
    ],
    roles: [
      { name: "Member", description: "Joins the Secretariat team to manage documents, registration, and meeting minutes." },
    ],
  },
  {
    name: "Finance Committee",
    description:
      "Guards the SCC's funds and keeps every peso transparent, tracked, and accounted for.",
    responsibilities: [
      "Accountable for the funds of the organization, and transparent to all transactions received and sent out.",
      "Handles financial documents such as liquidation, statement of financial position, monthly reports, and other forms.",
      "Assists the Treasurer and Auditor in their responsibilities.",
      "Oversees and analyzes financial statements and the organization's budget.",
    ],
    roles: [
      { name: "Member", description: "Joins the Finance team to help track funds, prepare reports, and support the Treasurer and Auditor." },
    ],
  },
  {
    name: "Publicity Committee",
    description:
      "Formulates the strategies and messaging that make SCC events land with students.",
    responsibilities: [
      "Formulates effective strategies to promote events, activities, or initiatives, utilizing various communication channels to reach the target audience.",
      "Generates engaging and compelling content, communicates key messages, and generates interest from the students.",
      "Utilizes social media algorithms with effective scheduling, brand identity, and copywriting.",
    ],
    roles: [
      { name: "Member", description: "Joins the Publicity team to craft messaging, campaigns, and social-media pushes for SCC events." },
    ],
  },
  {
    name: "Creatives Committee",
    description:
      "Produces the graphics and visuals that give every SCC event its signature look.",
    responsibilities: [
      "Produces a variety of traditional and digital publicity materials for events and internal purposes.",
      "Engages viewers with eye-catching and vibrant graphics that boost awareness and visibility of an event or an announcement.",
    ],
    roles: [
      { name: "Member", description: "Joins the Creatives team to design posters, banners, and social visuals for SCC events." },
    ],
  },
  {
    name: "Technicals Committee",
    description:
      "Runs the technical production behind SCC events — audio, video, lights, and streaming.",
    responsibilities: [
      "Manages technical production through utilizing technical equipment and online platforms used in events, such as audio, videos, and lighting tasks during activities / events.",
      "Must be knowledgeable in any of the following: OBS Studio, Projector use, PAR Lights, DMX controllers, basic computer troubleshooting, VirtualDJ, basic audio mixer troubleshooting, and basic cable management.",
    ],
    roles: [
      { name: "Member", description: "Joins the Technicals team to handle audio, video, lighting, and streaming for SCC events." },
    ],
  },
  {
    name: "Communications Committee",
    description:
      "Connects the SCC with external partners, sponsors, competitions, and outside inquiries.",
    responsibilities: [
      "Coordinates with external linkages related to sponsorship, partnership, outreach, collaboration, and the like.",
      "Responsible for scouting inter-collegiate, national, and international competitions eligible for the university's participation.",
      "Aids in responding to queries addressed to the council and refers them to the appropriate offices.",
    ],
    roles: [
      { name: "Member", description: "Joins the Communications team to build external partnerships and represent SCC in inter-org linkages." },
    ],
  },
];

// -----------------------------------------------------------------------------
// FAQ — first 5 questions applicants typically ask. Feel free to tweak.
// -----------------------------------------------------------------------------
export const FAQ = [
  {
    q: "Who can apply?",
    a: "Any bona fide FEU Alabang student in good academic standing is welcome to apply. First-year students are absolutely encouraged.",
  },
  {
    q: "Do I need past leadership experience?",
    a: "No! We look for passion, dependability, and a willingness to learn. Past experience is a plus but never a requirement.",
  },
  {
    q: "How much time will this take?",
    a: "It varies by committee — most members contribute 3 to 8 hours per week, with more during major events. Each committee card above lists an estimate.",
  },
  {
    q: "Can I apply to more than one committee?",
    a: "Yes. On the form you can rank up to three committee choices (1st, 2nd, and 3rd) and we'll try to match you with the best fit.",
  },
  {
    q: "When will I hear back?",
    a: "Shortlisted applicants receive an interview invite within a few days after applications close. Final decisions are announced by email on the announcement date.",
  },
];
