"use client"

import { motion } from "framer-motion"
import { Printer, Clock, TrendingDown } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function PaperFlyerSection() {
  const { t } = useLanguage()
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="py-20 sm:py-32 relative bg-background">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <motion.h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance scroll-fade-in ${isVisible ? "visible" : ""}`}
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            {t.paperFlyerPain.headline}
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            className={`text-xl sm:text-2xl text-muted-foreground mb-12 scroll-fade-in scroll-fade-in-delay-1 ${isVisible ? "visible" : ""}`}
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t.paperFlyerPain.subheadline}
          </motion.p>

          {/* Pain Points */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <motion.div
              className={`bg-card border border-border rounded-lg p-6 scroll-fade-in scroll-fade-in-delay-2 ${isVisible ? "visible" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 mx-auto">
                <Printer className="text-destructive" size={24} />
              </div>
              <p className="text-sm text-muted-foreground">Imprimir y pegar papel</p>
            </motion.div>

            <motion.div
              className={`bg-card border border-border rounded-lg p-6 scroll-fade-in scroll-fade-in-delay-3 ${isVisible ? "visible" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 mx-auto">
                <Clock className="text-destructive" size={24} />
              </div>
              <p className="text-sm text-muted-foreground">Perder tiempo valioso</p>
            </motion.div>

            <motion.div
              className={`bg-card border border-border rounded-lg p-6 scroll-fade-in scroll-fade-in-delay-4 ${isVisible ? "visible" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 mx-auto">
                <TrendingDown className="text-destructive" size={24} />
              </div>
              <p className="text-sm text-muted-foreground">50% no ven el aviso</p>
            </motion.div>
          </div>

          {/* Description */}
          <motion.p
            className={`text-lg text-foreground leading-relaxed scroll-fade-in scroll-fade-in-delay-5 ${isVisible ? "visible" : ""}`}
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {t.paperFlyerPain.description}
          </motion.p>
        </div>
      </div>
    </section>
  )
}
