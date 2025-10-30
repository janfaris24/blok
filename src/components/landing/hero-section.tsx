"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"
import { WaitlistModal } from "./waitlist-modal"

export function HeroSection() {
  const { t, language } = useLanguage()
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Track scroll progress through hero section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })

  // Image fades out as you scroll (1 → 0)
  const imageOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Grid fades in as you scroll (0 → 0.5)
  const gridOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.5])

  // Slight zoom effect on image
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])

  // Multi-layer parallax - each layer moves at different speed (increased for visibility)
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 300])    // Slowest - background
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 150])     // Medium - grid
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -100])  // Fastest - content (moves up)

  // Auto-play video on load
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play might be blocked, that's ok
      })
    }
  }, [])

  // Handle video load
  const handleVideoLoad = () => {
    setVideoLoaded(true)
  }

  // Open waitlist modal
  const handleWaitlistClick = () => {
    setWaitlistOpen(true)
  }

  return (
    <section id="hero" ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 sm:pt-28">
      {/* Coastal condo video background - fades out on scroll with parallax */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: imageOpacity,
          scale: imageScale,
          y: imageY,
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoLoad}
        >
          <source src="/videos/blok-condo-waves-optimized.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Dark overlay for text readability - works in both light/dark mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

      {/* Grid pattern background - fades in on scroll with parallax */}
      <motion.div
        className="absolute inset-0 grid-pattern"
        style={{ opacity: gridOpacity, y: gridY }}
      />

      <motion.div
        className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32"
        style={{ y: contentY }}
      >
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Eyebrow */}
          <div className="inline-block mb-6">
            <span className="text-sm font-medium text-white/80 drop-shadow-lg uppercase tracking-wider">{t.hero.eyebrow}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance leading-tight drop-shadow-2xl [text-shadow:_0_2px_10px_rgb(0_0_0_/_80%)]">
            {t.hero.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/95 mb-4 max-w-3xl mx-auto text-pretty leading-relaxed drop-shadow-lg [text-shadow:_0_1px_8px_rgb(0_0_0_/_60%)]">
            {t.hero.subheadline}
          </p>

          {/* Audience */}
          <p className="text-sm sm:text-base text-white/70 mb-8 max-w-2xl mx-auto drop-shadow-lg italic">
            {t.hero.audience}
          </p>

          {/* ONE Clear CTA */}
          <div className="flex flex-col items-center justify-center gap-4">
            <MagneticButton
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 text-base px-10 py-6 shadow-2xl"
              onClick={handleWaitlistClick}
            >
              <span className="flex flex-col items-center">
                <span className="font-semibold">{t.hero.waitlist}</span>
                <span className="text-xs opacity-80">{t.hero.waitlistSubtext}</span>
              </span>
            </MagneticButton>

            {/* Subtle login link for existing users */}
            <div className="text-xs text-white/60 mt-2">
              {language === 'es' ? '¿Ya tienes cuenta?' : 'Already have an account?'}{' '}
              <a
                href="/login"
                className="text-white/80 hover:text-white underline underline-offset-2 transition-colors"
              >
                {t.hero.login}
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Waitlist Modal */}
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </section>
  )
}
