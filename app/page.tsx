import { AppFeatures } from "@/components/AppFeatures";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Nav } from "@/components/Nav";
import { RevenueStats } from "@/components/RevenueStats";
import { Testimonials } from "@/components/Testimonials";

export default function Home() {
  return (
    <>
      {/* Background layers */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] pointer-events-none z-0" />

      <Nav />
      <Hero />
      <Features />
      <RevenueStats />
      <Testimonials />
      <HowItWorks />
      <AppFeatures />
      <Footer />
    </>
  );
}
