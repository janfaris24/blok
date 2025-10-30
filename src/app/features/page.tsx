"use client";

import { LandingLanguageProvider } from "@/contexts/landing-language-context";
import { Navigation } from "@/components/landing/navigation";
import { FeaturesSection } from "@/components/landing/features-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { AIIntelligence } from "@/components/landing/ai-intelligence";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function FeaturesPage() {
  return (
    <LandingLanguageProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-center mb-4">
              Características Completas
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
              Todo lo que necesitas para administrar tu condominio de forma profesional
            </p>
          </div>
          <FeaturesSection />
          <ComparisonSection />
          <AIIntelligence />
          <ProductShowcase />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </LandingLanguageProvider>
  );
}
