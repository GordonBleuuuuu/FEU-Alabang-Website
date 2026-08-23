// =============================================================================
//  COMMITTEE APPLICATIONS — FEU Alabang Student Coordinating Council
// -----------------------------------------------------------------------------
//  This one file drives the whole Apply section: whether it's open, when it
//  opens/closes, the process timeline, the committee list, and the FAQ.
//
//  QUICK CHECKLIST — items marked ⚠️ TODO need your real data before launch.
// =============================================================================

// Emergency override for unexpected situations. The normal open/closed state
// is calculated from APPLICATION_WINDOWS below. Applications are currently
// closed while the next application window is pending.
export const APPLICATIONS_ENABLED = false;

// Real dates are set — countdown is live and ticks to opensAt / closesAt below.
export const SHOW_COUNTDOWN = true;

export const APPLICATION_WINDOWS = [
  {
    label: "Batch 1",
    opensAt: "2026-08-19T09:00:00+08:00",
    closesAt: "2026-08-23T23:59:00+08:00",
  },
  {
    label: "Batch 2",
    opensAt: "2026-09-24T09:00:00+08:00",
    closesAt: "2026-09-28T23:59:00+08:00",
  },
];

export function getActiveApplicationWindow(now = Date.now()) {
  return APPLICATION_WINDOWS.find((window) => {
    const opensAt = new Date(window.opensAt).getTime();
    const closesAt = new Date(window.closesAt).getTime();
    return now >= opensAt && now <= closesAt;
  });
}

export function getNextApplicationWindow(now = Date.now()) {
  return APPLICATION_WINDOWS
    .filter((window) => new Date(window.opensAt).getTime() > now)
    .sort((a, b) => new Date(a.opensAt) - new Date(b.opensAt))[0];
}

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
  screeningWindow: "August 24 – 28, 2026",
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
    date: "August 24 – 28, 2026",
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
// COMMITTEES & LEADERSHIP POSITIONS
// Each entry appears as a card in the Apply section and as an option in the
// 1st/2nd/3rd choice dropdowns. `type` groups them visually so committees
// stay separate from leadership positions (Directors, Course Reps).
//   type: "committee"  → grouped under "Committees"
//   type: "leadership" → grouped under "Leadership Positions"
// (Defaults to "committee" if omitted.)
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
    name: "Documentation Committee",
    description:
      "Captures every SCC event and manages the photos, reports, and records that live on after.",
    responsibilities: [
      "Assists in documenting organizational activities and events.",
      "Manages all necessary documents for events — photos, reports, records, and other important files.",
      "Ensures all documents are accomplished properly and delivered on time.",
    ],
    roles: [
      { name: "Member", description: "Joins the Documentation team to capture SCC events and keep the records complete and timely." },
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
  {
    type: "leadership",
    name: "Board of Directors",
    description:
      "Senior leadership seats that head each SCC portfolio and steer strategy across committees.",
    requirements: [
      "Must have completed at least two terms in a leadership position within the institution.",
      "Willingness to commit time and actively participate in SCC-coordinated activities.",
      "Has strong organizational, communication, and management skills.",
    ],
    responsibilities: [
      "Leads one of the 10 director portfolios listed below.",
      "Reports progress, blockers, and outcomes directly to the executive board.",
      "Represents the SCC in cross-committee planning and external coordination.",
    ],
    // After picking Board of Directors as 1st choice, the Preferred Role
    // dropdown appears with the 9 specific director seats.
    roles: [
      { name: "Creatives Director", description: "Heads the Creatives team and its output." },
      { name: "Technicals Director", description: "Heads the Technicals team and event production." },
      { name: "Documentation Director", description: "Heads SCC event and initiative documentation." },
      { name: "Logistics Director", description: "Heads Logistics and event operations." },
      { name: "Publicity Director", description: "Heads Publicity strategy and campaigns." },
      { name: "Marketing Director", description: "Heads Marketing strategy, brand, and outreach campaigns." },
      { name: "Programs Director", description: "Heads Programs planning and execution." },
      { name: "Finance Director", description: "Heads Finance operations and reporting." },
      { name: "Secretariat Director", description: "Heads the Secretariat team." },
      { name: "Communication Director", description: "Heads external Communications and linkages." },
    ],
  },
  {
    type: "leadership",
    name: "Course Representative",
    description:
      "Represents your degree program inside the SCC general assembly and bridges the council with your program's students.",
    requirements: [
      "Must have at least 1 year of experience in an executive role in an RSO.",
      "Must demonstrate leadership and active participation in representing their course.",
      "Must showcase strong communication skills in representing the interests and concerns of the represented course.",
    ],
    responsibilities: [
      "Voices the concerns, ideas, and feedback of your degree program.",
      "Attends SCC general assemblies and relays SCC updates back to your classmates.",
      "Serves as the primary point of contact between the SCC and your program's student community.",
    ],
    // After picking Course Representative as 1st choice, the Preferred Role
    // dropdown appears with the specific degree-program seats.
    roles: [
      { name: "Electrical Engineering Representative", description: "Represents BS Electrical Engineering." },
      { name: "Electronics Engineering Representative", description: "Represents BS Electronics Engineering." },
      { name: "Computer Engineering Representative", description: "Represents BS Computer Engineering." },
      { name: "Mechanical Engineering Representative", description: "Represents BS Mechanical Engineering." },
      { name: "Business Administration Representative", description: "Represents BS Business Administration." },
      { name: "Psychology Representative", description: "Represents BS Psychology." },
      { name: "Tourism Management Representative", description: "Represents BS Tourism Management." },
      { name: "Multimedia Arts Representative", description: "Represents BA Multimedia Arts." },
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
    q: "What documents do I need to attach?",
    a: "Two files are required: (1) the Officer Information Sheet — download it from the Required Document section above, fill it out, and save it as a PDF named OIS_Surname and Name (e.g. OIS_Dela Cruz Juan); and (2) a photo or scan of your valid School ID. Both are uploaded in the application form's attachment section.",
  },
  {
    q: "My School ID photo won't upload — what should I do?",
    a: "The uploader is temporarily accepting PDFs only, so a JPG or PNG photo may be rejected. Quick workaround: save your School ID as a PDF and try again. On iPhone → open the photo → Share → Save to Files → tap-and-hold → Create PDF. On Android → open the photo → Share → Print → Save as PDF. On a laptop → right-click the image → Print → change destination to Save as PDF. Or upload to Google Drive → right-click → Open with Google Docs → File → Download → PDF Document. Full image support is being rolled out shortly.",
  },
  {
    q: "When will I hear back?",
    a: "Shortlisted applicants receive an interview invite within a few days after applications close. Final decisions are announced by email on the announcement date.",
  },
];
