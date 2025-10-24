"use client"

import { useState } from "react"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { Check } from "lucide-react"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"
import { WaitlistModal } from "./waitlist-modal"

export function FinalCTA() {
  const { t } = useLanguage()
  const [waitlistOpen, setWaitlistOpen] = useState(false)

  // Parse the trial string to get individual trust signals
  const trustSignals = t.finalCta.trial.split(' • ')

  // Open waitlist modal
  const handleWaitlistClick = () => {
    setWaitlistOpen(true)
  }

  return (
    <section id="contact" className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance">
            {t.finalCta.headline}
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-muted-foreground mb-8">{t.finalCta.subheadline}</p>

          {/* CTA Button */}
          <MagneticButton
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 text-lg px-12 py-6 h-auto mb-8"
            onClick={handleWaitlistClick}
          >
            {t.finalCta.waitlist}
          </MagneticButton>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {trustSignals.map((signal, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check size={20} className="text-primary" />
                <span className="text-sm text-muted-foreground">{signal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </section>
  )
}
