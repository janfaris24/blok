"use client"

import { Check, X } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function ComparisonSection() {
  const { t } = useLanguage()
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-balance scroll-fade-in ${isVisible ? "visible" : ""}`}
          >
            {t.comparison.headline}
          </h2>

          {/* Subheadline */}
          <p
            className={`text-lg sm:text-xl text-muted-foreground text-center mb-16 scroll-fade-in scroll-fade-in-delay-1 ${isVisible ? "visible" : ""}`}
          >
            {t.comparison.subheadline}
          </p>

          {/* Comparison Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before - Traditional Method */}
            <div
              className={`border border-destructive/30 bg-destructive/5 rounded-lg p-8 scroll-fade-in scroll-fade-in-delay-2 ${isVisible ? "visible" : ""}`}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X className="text-destructive" size={24} />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-center mb-6 text-foreground">
                {t.comparison.before.title}
              </h3>

              <ul className="space-y-4 mb-8">
                {t.comparison.before.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-destructive mt-1">•</span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-destructive/30">
                <p className="text-sm font-semibold text-destructive">
                  {t.comparison.before.total}
                </p>
              </div>
            </div>

            {/* After - With Blok */}
            <div
              className={`border border-primary/30 bg-primary/5 rounded-lg p-8 scroll-fade-in scroll-fade-in-delay-3 ${isVisible ? "visible" : ""}`}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="text-primary" size={24} />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-center mb-6 text-foreground">
                {t.comparison.after.title}
              </h3>

              <ul className="space-y-4 mb-8">
                {t.comparison.after.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="text-primary mt-1 flex-shrink-0" size={20} />
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-primary/30">
                <p className="text-sm font-semibold text-primary">
                  {t.comparison.after.total}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
