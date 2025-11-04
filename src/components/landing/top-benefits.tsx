"use client"

import { Bot, Route, Wrench, Megaphone, MessageCircle, LayoutDashboard, DollarSign, Calendar } from "lucide-react"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function TopBenefits() {
  const { t } = useLanguage()

  const benefits = [
    {
      icon: Bot,
      title: t.features.list.aiResponses.title,
      description: t.features.list.aiResponses.description,
    },
    {
      icon: Route,
      title: t.features.list.smartRouting.title,
      description: t.features.list.smartRouting.description,
    },
    {
      icon: Wrench,
      title: t.features.list.autoTickets.title,
      description: t.features.list.autoTickets.description,
    },
    {
      icon: DollarSign,
      title: t.features.list.payments.title,
      description: t.features.list.payments.description,
    },
    {
      icon: Calendar,
      title: t.features.list.meetings.title,
      description: t.features.list.meetings.description,
    },
    {
      icon: Megaphone,
      title: t.features.list.broadcasts.title,
      description: t.features.list.broadcasts.description,
    },
    {
      icon: MessageCircle,
      title: t.features.list.oneOnOne.title,
      description: t.features.list.oneOnOne.description,
    },
    {
      icon: LayoutDashboard,
      title: t.features.list.realtime.title,
      description: t.features.list.realtime.description,
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="border border-border rounded-lg p-6 hover:border-foreground/20 transition-colors">
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
