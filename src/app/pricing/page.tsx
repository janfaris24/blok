"use client";

import { LandingLanguageProvider } from "@/contexts/landing-language-context";
import { Navigation } from "@/components/landing/navigation";
import { PricingSection } from "@/components/landing/pricing-section";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function PricingPage() {
  return (
    <LandingLanguageProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <PricingSection />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </LandingLanguageProvider>
  );
}
