import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PublicCalendar from "@/components/calendar/PublicCalendar";
import About from "@/components/About";
import Leadership from "@/components/Leadership";
import Activities from "@/components/Activities";
import Initiatives from "@/components/Initiatives";
import Apply from "@/components/Apply";
import Resources from "@/components/Resources";
import Footer from "@/components/Footer";
import AuthRecoveryRedirect from "@/components/auth/AuthRecoveryRedirect";

export default function Home() {
  return (
    <main className="min-h-screen bg-cloud">
      <AuthRecoveryRedirect />
      <Navbar />
      <Hero />
      <PublicCalendar />
      <About />
      <Leadership />
      <Activities />
      <Initiatives />
      <Apply />
      <Resources />
      <Footer />
    </main>
  );
}
