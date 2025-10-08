"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function PricingSection() {
  const { ref, isVisible } = useScrollAnimation()

  const plans = [
    {
      name: "Básico",
      price: "$199",
      period: "/mes",
      description: "Hasta 50 unidades",
      features: ["WhatsApp ilimitado", "IA + Dashboard", "Soporte por email", "Tickets de mantenimiento"],
      popular: false,
    },
    {
      name: "Premium",
      price: "$299",
      period: "/mes",
      description: "Hasta 100 unidades",
      features: ["Todo en Básico", "SMS + Email", "Base de conocimiento", "Soporte prioritario", "Reportes avanzados"],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$399",
      period: "/mes",
      description: "100+ unidades",
      features: [
        "Todo en Premium",
        "Llamadas telefónicas",
        "Integración personalizada",
        "Cuenta dedicada",
        "SLA garantizado",
      ],
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <div ref={ref} className={`scroll-fade-in ${isVisible ? "visible" : ""}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 text-balance">
              Planes Simples. <span className="gradient-text">Sin Sorpresas.</span>
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12">Setup único de $99 en todos los planes</p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`gradient-border p-6 relative ${plan.popular ? "scale-105 shadow-2xl" : ""} scroll-fade-in scroll-fade-in-delay-${index + 1} ${isVisible ? "visible" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold">
                      ⭐ POPULAR
                    </span>
                  </div>
                )}

                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check size={20} className="text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    className={plan.popular ? "bg-foreground text-background hover:bg-foreground/90 w-full" : "w-full"}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => window.location.href = '/signup'}
                  >
                    Comenzar Ahora
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
