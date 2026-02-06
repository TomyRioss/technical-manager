import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { FeatureHighlights } from "@/components/landing/feature-highlights";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Hero />
      <TrustBar />
      <FeaturesGrid />
      <FeatureHighlights />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
