"use client"

import Image from "next/image"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"
import { MessageCircle, LayoutDashboard, Wrench } from "lucide-react"

export function ProductShowcase() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useLanguage()

  const showcases = [
    {
      image: "/dashboard-screenshot.png",
      icon: LayoutDashboard,
      title: t.showcase.items.dashboard.title,
      description: t.showcase.items.dashboard.description,
    },
    {
      image: "/conversations-screenshot.png",
      icon: MessageCircle,
      title: t.showcase.items.conversations.title,
      description: t.showcase.items.conversations.description,
    },
    {
      image: "/tickets-screenshot.png",
      icon: Wrench,
      title: t.showcase.items.maintenance.title,
      description: t.showcase.items.maintenance.description,
    }
  ]

  return (
    <section className="py-20 sm:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-[1400px] mx-auto">
          {/* Headline */}
          <div className="text-center mb-20">
            <h2
              ref={ref}
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance scroll-fade-in ${isVisible ? "visible" : ""}`}
            >
              {t.showcase.headline}
            </h2>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto scroll-fade-in scroll-fade-in-delay-1 ${isVisible ? "visible" : ""}`}>
              {t.showcase.subheadline}
            </p>
          </div>

          {/* Showcases */}
          <div className="space-y-32">
            {showcases.map((showcase, index) => (
              <div
                key={index}
                className={`grid lg:grid-cols-5 gap-12 lg:gap-16 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div
                  className={`lg:col-span-2 ${
                    index % 2 === 1 ? "lg:order-2" : ""
                  } scroll-fade-in ${isVisible ? "visible" : ""}`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <showcase.icon size={28} className="text-primary" />
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-bold leading-tight">
                      {showcase.title}
                    </h3>
                  </div>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {showcase.description}
                  </p>
                </div>

                {/* Screenshot */}
                <div
                  className={`lg:col-span-3 ${
                    index % 2 === 1 ? "lg:order-1" : ""
                  } scroll-fade-in scroll-fade-in-delay-1 ${isVisible ? "visible" : ""}`}
                >
                  <div className="relative rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                    <Image
                      src={showcase.image}
                      alt={showcase.title}
                      width={1400}
                      height={900}
                      className="w-full h-auto"
                      quality={100}
                      priority={index === 0}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
