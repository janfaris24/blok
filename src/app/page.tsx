"use client";

import { LandingLanguageProvider } from "@/contexts/landing-language-context";
import { Navigation } from "@/components/landing/navigation";
import { ScrollProgress } from "@/components/landing/scroll-progress";
import { HeroSection } from "@/components/landing/hero-section";
import { ScrollVideoDemo } from "@/components/landing/scroll-video-demo";
import { StickyFeatureSection } from "@/components/landing/sticky-feature-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { AIIntelligence } from "@/components/landing/ai-intelligence";
import { TwilightPeace } from "@/components/landing/twilight-peace";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <LandingLanguageProvider>
      <div className="min-h-screen bg-background">
        <ScrollProgress />
        <Navigation />
        <main>
          <HeroSection />
          <ScrollVideoDemo />
          <StickyFeatureSection />
          <FeaturesSection />
          <ProductShowcase />
          <AIIntelligence />
          <TwilightPeace />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </LandingLanguageProvider>
  );
}
