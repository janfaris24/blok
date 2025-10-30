"use client"

import { MessageCircle, Brain, Zap } from "lucide-react"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function SimpleSolution() {
  const { t } = useLanguage()

  const steps = [
    {
      icon: MessageCircle,
      title: t.solution.steps.step1.title,
      subtitle: t.solution.steps.step1.subtitle,
      example: t.solution.steps.step1.example,
    },
    {
      icon: Brain,
      title: t.solution.steps.step2.title,
      subtitle: t.solution.steps.step2.subtitle,
      example: t.solution.steps.step2.example,
    },
    {
      icon: Zap,
      title: t.solution.steps.step3.title,
      subtitle: t.solution.steps.step3.subtitle,
      example: t.solution.steps.step3.example,
    },
  ]

  return (
    <section className="py-16 sm:py-24 relative bg-background">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t.solution.headline}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            {t.solution.subheadline}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-foreground/5 flex items-center justify-center">
                <step.icon size={32} className="text-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{step.subtitle}</p>
              <div className="text-xs font-mono bg-muted px-3 py-2 rounded inline-block">
                {step.example}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
