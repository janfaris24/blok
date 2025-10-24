"use client"

import { Bot, Target, Wrench, Megaphone, MessageCircle, BarChart3, DollarSign } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function FeaturesSection() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useLanguage()

  const features = [
    {
      icon: DollarSign,
      title: t.features.list.payments.title,
      description: t.features.list.payments.description,
    },
    {
      icon: Bot,
      title: t.features.list.aiResponses.title,
      description: t.features.list.aiResponses.description,
    },
    {
      icon: Target,
      title: t.features.list.smartRouting.title,
      description: t.features.list.smartRouting.description,
    },
    {
      icon: Wrench,
      title: t.features.list.autoTickets.title,
      description: t.features.list.autoTickets.description,
    },
    {
      icon: Megaphone,
      title: t.features.list.broadcasts.title,
      description: t.features.list.broadcasts.description,
    },
    {
      icon: BarChart3,
      title: t.features.list.realtime.title,
      description: t.features.list.realtime.description,
    },
  ]

  return (
    <section id="features" className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <h2
            ref={ref}
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 text-balance scroll-fade-in ${isVisible ? "visible" : ""}`}
          >
            {t.features.headline}
          </h2>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`border border-border rounded-lg p-6 hover:scale-105 transition-all duration-300 group scroll-fade-in scroll-fade-in-delay-${(index % 3) + 1} ${isVisible ? "visible" : ""}`}
              >
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-foreground/5 border border-border flex items-center justify-center mb-4 group-hover:bg-foreground/10 transition-colors">
                    <feature.icon size={24} className="text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
