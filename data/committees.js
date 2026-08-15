// =============================================================================
//  COMMITTEE APPLICATIONS — FEU Alabang Student Coordinating Council
// -----------------------------------------------------------------------------
//  APPLICATIONS_OPEN: flip to `true` when the application window opens.
//  When false, the Apply section shows a "Coming soon" state with a
//  Notify-me email signup. When true, it shows the full application form.
//
//  COMMITTEES: fill this array with the SCC's actual committees and roles.
//  Each committee: { name, description, roles: [{ name, description }] }
//  Any committee added here is picked up automatically by the form dropdown
//  and displayed in the "What you can join" grid on the Apply section.
// =============================================================================

export const APPLICATIONS_OPEN = false;

// Optional target date shown in the "Coming soon" state. Leave as null to
// simply say "Applications open soon" without a specific date.
// Format: "Month Day, Year" — e.g. "November 15, 2026"
export const APPLICATIONS_OPEN_DATE = null;

export const committees = [
  // Example structure — replace with your real committees when ready:
  //
  // {
  //   name: "Events Committee",
  //   description: "Plans and executes the SCC's flagship programs.",
  //   roles: [
  //     { name: "Head", description: "Leads the committee and coordinates with the executive board." },
  //     { name: "Officer", description: "Assists in event logistics, promotions, and program flow." },
  //   ],
  // },
];
