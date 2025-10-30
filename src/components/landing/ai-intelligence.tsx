"use client"

import { useState, useEffect, useRef } from "react"
import { Brain, Zap, BookOpen } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useTypewriter } from "@/hooks/use-typewriter"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function AIIntelligence() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useLanguage()
  const [demoVisible, setDemoVisible] = useState(false)
  const demoRef = useRef<HTMLDivElement>(null)

  // Trigger typewriter when demo section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !demoVisible) {
            setDemoVisible(true)
          }
        })
      },
      { threshold: 0.5 }
    )

    if (demoRef.current) {
      observer.observe(demoRef.current)
    }

    return () => observer.disconnect()
  }, [demoVisible])

  // Loop the typewriter effect
  useEffect(() => {
    if (!demoVisible) return

    // Calculate total animation duration
    const totalDuration = 2400 + (t.ai.demo.exampleAction.length * 50) + 2000 // last delay + typing time + pause

    const loopTimer = setTimeout(() => {
      setDemoVisible(false)
      setTimeout(() => setDemoVisible(true), 100)
    }, totalDuration)

    return () => clearTimeout(loopTimer)
  }, [demoVisible, t.ai.demo.exampleAction])

  // Typewriter animations for AI demo output
  const intentText = useTypewriter({
    text: `"${t.ai.demo.exampleIntent}"`,
    speed: 50,
    delay: 300,
    enabled: demoVisible
  })

  const categoryText = useTypewriter({
    text: `"${t.ai.demo.exampleCategory}"`,
    speed: 50,
    delay: 1000,
    enabled: demoVisible
  })

  const priorityText = useTypewriter({
    text: `"${t.ai.demo.examplePriority}"`,
    speed: 50,
    delay: 1700,
    enabled: demoVisible
  })

  const actionText = useTypewriter({
    text: `"${t.ai.demo.exampleAction}"`,
    speed: 50,
    delay: 2400,
    enabled: demoVisible
  })

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
    <section id="intelligence" className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <h2
            ref={ref}
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 text-balance scroll-fade-in ${isVisible ? "visible" : ""}`}
          >
            {t.ai.headline} <span className="text-primary">{t.ai.headlineAccent}</span>
          </h2>

          {/* Control Section */}
          <div className={`max-w-3xl mx-auto mb-16 scroll-fade-in scroll-fade-in-delay-1 ${isVisible ? "visible" : ""}`}>
            <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-center mb-4 text-foreground">
                {t.ai.control.title}
              </h3>
              <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                {t.ai.control.description}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {t.ai.control.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {capabilities.map((capability, index) => (
              <div
                key={index}
                className={`border border-border rounded-lg p-6 scroll-fade-in scroll-fade-in-delay-${index + 1} ${isVisible ? "visible" : ""}`}
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
          <div
            ref={demoRef}
            className={`border border-border rounded-lg scroll-fade-in ${isVisible ? "visible" : ""}`}
          >
            <div className="bg-card rounded-lg p-6 sm:p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Input */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">{t.ai.demo.input}</div>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground">
                    "{t.ai.demo.exampleMessage}"
                  </div>
                </div>

                {/* Output with Typewriter Effect */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">{t.ai.demo.output}</div>
                  <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-2">
                    <div>
                      <span className="text-secondary">intent:</span>{" "}
                      <span className="text-foreground">
                        {intentText.displayText}
                        {!intentText.isComplete && <span className="animate-pulse">|</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary">category:</span>{" "}
                      <span className="text-foreground">
                        {categoryText.displayText}
                        {intentText.isComplete && !categoryText.isComplete && <span className="animate-pulse">|</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary">priority:</span>{" "}
                      <span className="text-primary">
                        {priorityText.displayText}
                        {categoryText.isComplete && !priorityText.isComplete && <span className="animate-pulse">|</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary">action:</span>{" "}
                      <span className="text-foreground">
                        {actionText.displayText}
                        {priorityText.isComplete && !actionText.isComplete && <span className="animate-pulse">|</span>}
                      </span>
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
