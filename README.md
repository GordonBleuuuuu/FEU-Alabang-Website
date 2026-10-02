# FEU Alabang — Student Coordinating Council

The official web presence for the **FEU Alabang Student Coordinating Council (SCC)** — _Empowered. United. Brave._

Built with **Next.js (App Router)**, **Tailwind CSS**, and **lucide-react**. Designed for zero-config deployment on **Vercel**.

---

## ✨ Features

- **Glassmorphism sticky navigation** with scroll-spy active highlighting and a mobile menu
- **Hero** — "The Voice and Vision of the FEU Alabang Student Body" with CTAs and animated crest
- **About** — Mission & Vision cards plus a campus-life gallery grid
- **Leadership** — interactive batch switcher (Batch 1 → Batch 6) with modern officer cards, position badges, and social links
- **Activities** — responsive grid of all 13 signature programs with tag pills and icons
- **Initiatives & Accomplishments** — stat band + core initiative pillars
- **Resources & Contact** — quick-link cards and a contact panel (`ascc@feualabang.edu.ph`)
- Fully responsive, accessible, dark-on-brand theming, and reduced-motion friendly

---

## 🚀 Getting started

### SCC ID verification

Apply `supabase/migrations/202610020001_scc_id_verification.sql` to the connected Supabase project before using the ID feature. The migration loads the 8 Batch 6 executives from `data/leadership.js` and 19 approved committee members from `ACCEPTED_COMMITTEES` in `data/committees.js`. These are a snapshot of the current files; later roster changes require an update in the internal ID page.

Authorized SCC Executive and SADU accounts can open `/admin/passes` to add or edit an SCC ID, attach a photo URL, download its QR image, or revoke it. Scanning the QR opens `/verify/<token>`; staff sign in and compare the displayed record and photo with the person presenting the ID. Committee members do not have photos in the current source files, so add their approved photos before using the QR page as a visual identity check.

Generate the QR images from the ID manager **after** the site is deployed at its final domain. The QR images previously made from plain `SCC-B6-###` codes do not open the verification page. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin if staff will manage IDs from a different host or a local development server. Confirm each holder's full name and role before printing.

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Production build
npm run build && npm start
```

---

## ▲ Deploy to Vercel

1. Push this folder to a GitHub / GitLab / Bitbucket repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects **Next.js** — no configuration needed. Click **Deploy**.

Or deploy from the CLI:

```bash
npm i -g vercel
vercel
```

---

## 🗂 Project structure

```
feu-alabang-scc/
├── app/
│   ├── globals.css        # Tailwind layers + brand design primitives
│   ├── layout.jsx         # Root layout & metadata
│   └── page.jsx           # Composes all sections
├── components/
│   ├── Crest.jsx          # Self-contained SVG shield (no image assets)
│   ├── Navbar.jsx         # Sticky glass nav + scroll-spy ("use client")
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Leadership.jsx     # Interactive batch switcher ("use client")
│   ├── Activities.jsx
│   ├── Initiatives.jsx
│   ├── Resources.jsx
│   └── Footer.jsx
├── data/
│   ├── activities.js      # Events, initiatives, accomplishments
│   └── leadership.js      # Batch cohorts & officers (PLACEHOLDER names)
├── public/
│   └── favicon.svg
├── tailwind.config.js     # Brand palette & animations
├── next.config.mjs
└── package.json
```

---

## 🎨 Brand palette

| Token          | Hex       | Use                     |
| -------------- | --------- | ----------------------- |
| `feu.green`    | `#004B23` | Primary brand green     |
| `feu.teal`     | `#0F5257` | Secondary green-teal    |
| `feu.moss`     | `#0A3D1F` | Deep backgrounds        |
| `gold.DEFAULT` | `#FFB703` | Primary gold accent     |
| `gold.deep`    | `#D4AF37` | Muted gold              |
| `ink`          | `#0F172A` | Slate dark              |
| `cloud`        | `#F8FAFC` | Light slate background  |

---

## 🖼 Add the official logo

The header, hero, and footer use [`components/Logo.jsx`](components/Logo.jsx), which loads
**`public/scc-logo.png`**. Until that file exists it gracefully falls back to a built-in SVG
crest, so nothing ever breaks.

**To use the real crest:** save the SCC logo image as **`public/scc-logo.png`** (a transparent
PNG works best). That's it — every logo across the site updates automatically. Optionally replace
`public/favicon.svg` with your own browser-tab icon.

## 🔤 Typography

The site uses **Montserrat** (weights 400–900) via `next/font/google`, self-hosted at build time
for zero layout shift. Headings use the bold/black weights (`font-bold`, `font-black`). Configured
in [`app/layout.jsx`](app/layout.jsx) and wired into Tailwind's `font-sans` in
[`tailwind.config.js`](tailwind.config.js).

## ✏️ Customizing content

- **Officers & batches** → edit [`data/leadership.js`](data/leadership.js). Names are placeholders (`"Officer Name"`) — replace them, and fill in `socials` (`facebook`, `instagram`, `linkedin`, `email`).
- **Events & initiatives** → edit [`data/activities.js`](data/activities.js).
- **Colors & animations** → edit [`tailwind.config.js`](tailwind.config.js).
- **Gallery / officer photos** → the design uses gradient placeholders so it runs with zero assets. Drop real images into `public/` and swap the placeholders when ready.

---

© FEU Alabang Student Coordinating Council · Est. 2021
