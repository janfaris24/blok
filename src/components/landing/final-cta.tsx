import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function FinalCTA() {
  const trustSignals = ["Sin tarjeta de crédito", "Setup en 30 minutos", "Soporte en español"]

  return (
    <section id="contact" className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance">
            ¿Listo para Transformar Tu <span className="gradient-text">Condominio?</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-muted-foreground mb-8">Únete a 30+ edificios que ya usan Blok</p>

          {/* CTA Button */}
          <Button
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 text-lg px-12 py-6 h-auto mb-8"
            onClick={() => window.location.href = '/signup'}
          >
            Comenzar Ahora - Gratis
          </Button>

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
    </section>
  )
}
