"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function DashboardPreview() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useLanguage()

  return (
    <section className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <div ref={ref} className={`scroll-fade-in ${isVisible ? "visible" : ""}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 text-balance">
              {t.dashboardPreview.headline}
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t.dashboardPreview.subheadline}
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className={`relative scroll-fade-in ${isVisible ? "visible" : ""}`}>
            <div className="gradient-border p-1">
              <div className="bg-card rounded-lg p-4 sm:p-8">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Simulated dashboard elements */}
                  <div className="absolute inset-0 p-6 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-32 bg-background/50 rounded" />
                      <div className="flex gap-2">
                        <div className="h-8 w-8 bg-background/50 rounded-full" />
                        <div className="h-8 w-8 bg-background/50 rounded-full" />
                      </div>
                    </div>

                    {/* Content area */}
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div className="col-span-1 bg-background/50 rounded-lg" />
                      <div className="col-span-2 bg-background/50 rounded-lg" />
                    </div>
                  </div>

                  {/* Overlay button */}
                  <Button variant="outline" className="relative z-10 gap-2 bg-background/80 backdrop-blur">
                    <ExternalLink size={16} />
                    {t.dashboardPreview.cta}
                  </Button>
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl -z-10 opacity-50" />
          </div>
        </div>
      </div>
    </section>
  )
}
