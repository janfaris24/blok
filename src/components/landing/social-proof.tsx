"use client"

import { Shield, Users, Clock, Star } from "lucide-react"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function SocialProof() {
  const { language } = useLanguage()

  const stats = [
    {
      icon: Users,
      value: "Beta",
      label: language === 'es' ? "Fase de Pruebas" : "Testing Phase",
    },
    {
      icon: Clock,
      value: "24/7",
      label: language === 'es' ? "Respuestas Automáticas" : "Automated Responses",
    },
    {
      icon: Star,
      value: "95%",
      label: language === 'es' ? "Satisfacción" : "Satisfaction",
    },
    {
      icon: Shield,
      value: "100%",
      label: language === 'es' ? "Datos Seguros" : "Data Security",
    },
  ]

  return (
    <section className="py-12 sm:py-16 relative bg-background">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm uppercase tracking-wider text-muted-foreground mb-8">
            {language === 'es' ? 'Confiado por administradores en Puerto Rico' : 'Trusted by administrators in Puerto Rico'}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-foreground/5 flex items-center justify-center">
                  <stat.icon size={24} className="text-foreground" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
