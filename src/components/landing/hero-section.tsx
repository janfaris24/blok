"use client"

import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-block mb-6">
            <span className="text-sm font-medium gradient-text">{t.hero.eyebrow}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
            {t.hero.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
            {t.hero.subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 text-base px-8"
              onClick={() => window.location.href = '/signup'}
            >
              {t.hero.cta}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 gap-2 bg-transparent"
              onClick={() => window.location.href = '/login'}
            >
              {t.hero.login}
            </Button>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-muted-foreground">
            {t.hero.socialProof.replace('{count}', '30')}
          </p>

          {/* Mockup placeholder */}
          <div className="mt-16 relative">
            <div className="gradient-border p-1 max-w-4xl mx-auto">
              <div className="bg-card rounded-lg p-8 sm:p-12">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play size={32} className="text-primary" />
                    </div>
                    <p className="text-muted-foreground">WhatsApp + Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
