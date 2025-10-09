"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useLanguage } from "@/contexts/language-context"

export function PricingSection() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useLanguage()

  const plans = [
    {
      name: t.pricing.plans.basic.name,
      units: t.pricing.plans.basic.units,
      ideal: t.pricing.plans.basic.ideal,
      popular: false,
    },
    {
      name: t.pricing.plans.premium.name,
      units: t.pricing.plans.premium.units,
      ideal: t.pricing.plans.premium.ideal,
      badge: t.pricing.plans.premium.badge,
      popular: true,
    },
    {
      name: t.pricing.plans.enterprise.name,
      units: t.pricing.plans.enterprise.units,
      ideal: t.pricing.plans.enterprise.ideal,
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
              {t.pricing.headline}
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t.pricing.subheadline}
            </p>
          </div>

          {/* Features Included */}
          <div className={`gradient-border p-8 mb-12 scroll-fade-in ${isVisible ? "visible" : ""}`}>
            <h3 className="text-xl font-semibold text-center mb-6">{t.pricing.features.title}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {t.pricing.features.list.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check size={18} className="text-primary shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Tiers */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`gradient-border p-6 relative ${plan.popular ? "scale-105 shadow-2xl" : ""} scroll-fade-in scroll-fade-in-delay-${index + 1} ${isVisible ? "visible" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex flex-col h-full items-center text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-lg text-primary font-semibold mb-1">{plan.units}</p>
                  <p className="text-sm text-muted-foreground mb-4">{plan.ideal}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 text-lg px-12"
              onClick={() => window.open('https://forms.google.com', '_blank')}
            >
              {t.pricing.cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
