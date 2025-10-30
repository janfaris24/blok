"use client"

import { DollarSign, Clock, Target } from "lucide-react"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function TopBenefits() {
  const { t } = useLanguage()

  const benefits = [
    {
      icon: DollarSign,
      title: t.features.list.payments.title,
      description: t.features.list.payments.description,
    },
    {
      icon: Clock,
      title: t.features.list.aiResponses.title,
      description: t.features.list.aiResponses.description,
    },
    {
      icon: Target,
      title: t.features.list.smartRouting.title,
      description: t.features.list.smartRouting.description,
    },
  ]

  return (
    <section className="py-16 sm:py-24 relative bg-background">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t.features.headline}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="border border-border rounded-lg p-6">
              <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-4">
                <benefit.icon size={24} className="text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
