import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="selection:bg-primary-container selection:text-on-primary-container">
      <Navbar />
      <main className="relative">
        <HeroSection />
        <FeatureGrid />
        <HowItWorks />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
