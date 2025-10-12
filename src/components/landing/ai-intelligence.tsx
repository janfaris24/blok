"use client"

import { Brain, Zap, BookOpen } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function AIIntelligence() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useLanguage()

  const capabilities = [
    {
      icon: Brain,
      title: t.ai.capabilities.intent.title,
      description: t.ai.capabilities.intent.description,
    },
    {
      icon: Zap,
      title: t.ai.capabilities.priority.title,
      description: t.ai.capabilities.priority.description,
    },
    {
      icon: BookOpen,
      title: t.ai.capabilities.knowledge.title,
      description: t.ai.capabilities.knowledge.description,
    },
  ]

  return (
    <section className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <h2
            ref={ref}
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 text-balance scroll-fade-in ${isVisible ? "visible" : ""}`}
          >
            {t.ai.headline} <span className="gradient-text">{t.ai.headlineAccent}</span>
          </h2>

          {/* Capabilities */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {capabilities.map((capability, index) => (
              <div
                key={index}
                className={`gradient-border p-6 scroll-fade-in scroll-fade-in-delay-${index + 1} ${isVisible ? "visible" : ""}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <capability.icon size={28} className="text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{capability.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{capability.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Analysis Demo */}
          <div className={`gradient-border p-1 scroll-fade-in ${isVisible ? "visible" : ""}`}>
            <div className="bg-card rounded-lg p-6 sm:p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Input */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">{t.ai.demo.input}</div>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground">
                    "El aire acondicionado de mi apartamento no está enfriando. Es urgente porque hace mucho calor."
                  </div>
                </div>

                {/* Output */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">{t.ai.demo.output}</div>
                  <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-2">
                    <div>
                      <span className="text-secondary">intent:</span>{" "}
                      <span className="text-foreground">"maintenance_request"</span>
                    </div>
                    <div>
                      <span className="text-secondary">category:</span> <span className="text-foreground">"hvac"</span>
                    </div>
                    <div>
                      <span className="text-secondary">priority:</span> <span className="text-primary">"high"</span>
                    </div>
                    <div>
                      <span className="text-secondary">action:</span>{" "}
                      <span className="text-foreground">"create_ticket"</span>
                    </div>
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
