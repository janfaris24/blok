"use client"

import { MessageSquare, Bot, LayoutDashboard } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function SolutionSection() {
  const { t } = useLanguage()

  const steps = [
    {
      icon: MessageSquare,
      title: t.solution.steps.step1.title,
      description: t.solution.steps.step1.subtitle,
      example: t.solution.steps.step1.example,
    },
    {
      icon: Bot,
      title: t.solution.steps.step2.title,
      description: t.solution.steps.step2.subtitle,
      example: t.solution.steps.step2.example,
    },
    {
      icon: LayoutDashboard,
      title: t.solution.steps.step3.title,
      description: t.solution.steps.step3.subtitle,
      example: t.solution.steps.step3.example,
    },
  ]

  return (
    <section id="solution" className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 text-balance">
            {t.solution.headline}
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            {t.solution.subheadline}
          </p>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-30" />

            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  {/* Step number */}
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary font-bold text-lg relative z-10 border-4 border-background">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
                    <step.icon size={36} className="text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground mb-3 leading-relaxed">{step.description}</p>
                  <div className="inline-block px-4 py-2 bg-muted rounded-lg text-sm font-mono text-foreground">
                    {step.example}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
