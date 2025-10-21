"use client";

import { LandingLanguageProvider } from "@/contexts/landing-language-context";
import { Navigation } from "@/components/landing/navigation";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function FAQPage() {
  return (
    <LandingLanguageProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <FAQSection />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </LandingLanguageProvider>
  );
}
