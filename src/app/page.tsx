"use client";

import { LandingLanguageProvider } from "@/contexts/landing-language-context";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { PaperFlyerSection } from "@/components/landing/paper-flyer-section";
import { BrandVideoSection } from "@/components/landing/brand-video-section";
import { ScrollVideoDemo } from "@/components/landing/scroll-video-demo";
import { SimpleSolution } from "@/components/landing/simple-solution";
import { TopBenefits } from "@/components/landing/top-benefits";
import { SocialProof } from "@/components/landing/social-proof";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <LandingLanguageProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>
          <HeroSection />
          <PaperFlyerSection />
          <ScrollVideoDemo />
          <BrandVideoSection />
          <SimpleSolution />
          <TopBenefits />
          <SocialProof />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </LandingLanguageProvider>
  );
}
