"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"
import { MessageCircle, LayoutDashboard, Wrench } from "lucide-react"

export function ProductShowcase() {
  const { ref, isVisible } = useScrollAnimation()
  const { t } = useLanguage()
  const [rotations, setRotations] = useState([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ])
  const [isHovering, setIsHovering] = useState([false, false, false])

  const handleMouseMove = (index: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    const newRotations = [...rotations]
    newRotations[index] = { x: -y * 15, y: x * 15 }  // Max 15deg tilt (increased for visibility)
    setRotations(newRotations)

    const newHovering = [...isHovering]
    newHovering[index] = true
    setIsHovering(newHovering)
  }

  const handleMouseLeave = (index: number) => () => {
    const newRotations = [...rotations]
    newRotations[index] = { x: 0, y: 0 }
    setRotations(newRotations)

    const newHovering = [...isHovering]
    newHovering[index] = false
    setIsHovering(newHovering)
  }

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
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                      {showcase.title}
                    </h3>
                  </div>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {showcase.description}
                  </p>
                </div>

                {/* Screenshot with 3D Tilt */}
                <div
                  className={`lg:col-span-3 ${
                    index % 2 === 1 ? "lg:order-1" : ""
                  } scroll-fade-in scroll-fade-in-delay-1 ${isVisible ? "visible" : ""}`}
                  style={{ perspective: '1500px' }}
                >
                  <motion.div
                    className={`relative rounded-xl overflow-hidden shadow-2xl cursor-pointer ${
                      isHovering[index] ? 'ring-2 ring-primary/50' : ''
                    }`}
                    style={{ transformStyle: 'preserve-3d' }}
                    onMouseMove={handleMouseMove(index)}
                    onMouseLeave={handleMouseLeave(index)}
                    animate={{
                      rotateX: rotations[index].x,
                      rotateY: rotations[index].y,
                      scale: isHovering[index] ? 1.05 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                  >
                    <Image
                      src={showcase.image}
                      alt={showcase.title}
                      width={1400}
                      height={900}
                      className="w-full h-auto"
                      quality={100}
                      priority={index === 0}
                    />
                    {/* Hover indicator */}
                    {isHovering[index] && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none"
                      />
                    )}
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
