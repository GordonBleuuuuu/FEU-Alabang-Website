// =============================================================================
//  COMMITTEE APPLICATIONS — FEU Alabang Student Coordinating Council
// -----------------------------------------------------------------------------
//  This one file drives the whole Apply section: whether it's open, when it
//  opens/closes, the process timeline, the committee list, and the FAQ.
//
//  QUICK CHECKLIST — items marked ⚠️ TODO need your real data before launch.
// =============================================================================

// ⚠️ TODO: flip to true when the application window is live.
export const APPLICATIONS_OPEN = false;

// Show/hide the live countdown timer. Keep false until real opens/closes
// dates are set below — otherwise the countdown would tick to a placeholder.
export const SHOW_COUNTDOWN = false;

// -----------------------------------------------------------------------------
// KEY DATES — used by the countdown timer, coming-soon banner, and timeline.
// ⚠️ TODO: replace these with your real cycle dates before launch.
// Use ISO strings so timezones stay correct. Times default to 23:59 PHT.
// -----------------------------------------------------------------------------
export const APPLICATION_CYCLE = {
  // When the form goes live to accept submissions.
  opensAt: "2026-12-01T09:00:00+08:00",
  // Last moment applicants can submit.
  closesAt: "2026-12-14T23:59:00+08:00",
  // When interviews are scheduled to run.
  interviewsWindow: "December 16 – 20, 2026",
  // When accepted committee members are announced.
  announcementDate: "December 22, 2026",
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
    title: "Applications Open",
    date: "Dec 1 – 14, 2026",
    description: "Submit your application through the form below.",
  },
  {
    step: "2",
    title: "Screening",
    date: "Dec 15, 2026",
    description: "The SCC reviews every submission carefully.",
  },
  {
    step: "3",
    title: "Interviews",
    date: "Dec 16 – 20, 2026",
    description: "Shortlisted applicants are invited to a short interview.",
  },
  {
    step: "4",
    title: "Announcement",
    date: "Dec 22, 2026",
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
    name: "Events Committee",
    description:
      "Plans and executes the SCC's flagship programs — ATamEx, ATamOneJam, ATamForJuan, and more.",
    hoursPerWeek: "5 – 8 hrs",
    meetingCadence: "Weekly + event days",
    roles: [
      { name: "Head", description: "Leads the committee and coordinates with the executive board." },
      { name: "Deputy Head", description: "Supports the Head and steps in when needed." },
      { name: "Officer", description: "Assists in event logistics, promotions, and program flow." },
      { name: "Member", description: "Volunteers on event day and helps with preparation." },
    ],
  },
  {
    name: "Communications Committee",
    description:
      "Owns the SCC voice online and offline — social media, publicity materials, and community engagement.",
    hoursPerWeek: "4 – 6 hrs",
    meetingCadence: "Weekly",
    roles: [
      { name: "Head", description: "Sets the content strategy and manages the team." },
      { name: "Content Writer", description: "Drafts captions, announcements, and articles." },
      { name: "Graphic Designer", description: "Creates posters, banners, and social visuals." },
      { name: "Photo / Video", description: "Documents SCC events and produces reels." },
    ],
  },
  {
    name: "Finance Committee",
    description:
      "Handles the SCC budget, liquidation, sponsorships, and event finance planning.",
    hoursPerWeek: "3 – 5 hrs",
    meetingCadence: "Bi-weekly",
    roles: [
      { name: "Head", description: "Oversees all finance operations and reporting." },
      { name: "Bookkeeper", description: "Tracks expenses and manages receipts." },
      { name: "Sponsorship Officer", description: "Reaches out to partners and closes sponsorships." },
    ],
  },
  {
    name: "External Affairs Committee",
    description:
      "Represents the SCC to other councils, RSOs, and off-campus partners.",
    hoursPerWeek: "3 – 5 hrs",
    meetingCadence: "Bi-weekly",
    roles: [
      { name: "Head", description: "Builds and maintains external partnerships." },
      { name: "Liaison", description: "Attends inter-council meetings on behalf of the SCC." },
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
