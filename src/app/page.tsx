"use client";

import { LandingLanguageProvider } from "@/contexts/landing-language-context";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { DemoSection } from "@/components/landing/demo-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { AIIntelligence } from "@/components/landing/ai-intelligence";
import { PricingSection } from "@/components/landing/pricing-section";
import { WhyPuertoRico } from "@/components/landing/why-puerto-rico";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <LandingLanguageProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>
          <HeroSection />
          <DemoSection />
          <ProblemSection />
          <SolutionSection />
          <FeaturesSection />
          <AIIntelligence />
          <PricingSection />
          <WhyPuertoRico />
          <FAQSection />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </LandingLanguageProvider>
  );
}
