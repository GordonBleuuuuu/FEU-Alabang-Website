import "./globals.css";
import { Montserrat } from "next/font/google";

// Montserrat is the brand typeface — regular through black (900) so headings
// can use bold/black weights while body copy stays clean and legible.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata = {
  title: "FEU Alabang Student Coordinating Council",
  description:
    "The Voice and Vision of the FEU Alabang Student Body. Empowered. United. Brave.",
  keywords: [
    "FEU Alabang",
    "Student Coordinating Council",
    "SCC",
    "ATamaraws",
    "student government",
  ],
  authors: [{ name: "FEU Alabang SCC" }],
  openGraph: {
    title: "FEU Alabang Student Coordinating Council",
    description:
      "The Voice and Vision of the FEU Alabang Student Body. Empowered. United. Brave.",
    type: "website",
  },
  // Favicon: Next.js auto-serves app/icon.png and app/apple-icon.png as icons.
};

export const viewport = {
  themeColor: "#004B23",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
