"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"
import { WaitlistModal } from "./waitlist-modal"

export function HeroSection() {
  const { t, language } = useLanguage()
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      // If video is already loaded
      if (video.readyState >= 3) {
        setVideoLoaded(true);
      }
    }
  }, [])

  // Open waitlist modal
  const handleWaitlistClick = () => {
    setWaitlistOpen(true)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 sm:pt-28">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-block mb-6">
            <span className="text-sm font-medium gradient-text">{t.hero.eyebrow}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
            {t.hero.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
            {t.hero.subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 text-base px-8"
              onClick={handleWaitlistClick}
            >
              {t.hero.waitlist}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 gap-2 bg-transparent"
              onClick={() => window.location.href = '/login'}
            >
              {t.hero.login}
            </Button>
          </div>

          {/* Removed Social Proof */}
          {/* <p className="text-sm text-muted-foreground">
            {t.hero.socialProof.replace('{count}', '30')}
          </p> */}

          {/* Video Demo */}
          <div className="mt-16 relative">
            <div className="gradient-border p-1 max-w-4xl mx-auto">
              <div className="bg-card rounded-lg p-4 sm:p-6">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {/* Loading Placeholder */}
                  {!videoLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                          {language === 'es' ? 'Cargando demo...' : 'Loading demo...'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Video */}
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className={`w-full h-full object-cover transition-opacity duration-500 ${
                      videoLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoadedData={() => setVideoLoaded(true)}
                    onCanPlayThrough={() => setVideoLoaded(true)}
                    onError={() => {
                      setVideoError(true);
                      setVideoLoaded(true);
                    }}
                  >
                    <source src="/videos/BLOK-DEMO.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Error message if video fails */}
                  {videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <p className="text-sm text-muted-foreground">
                        {language === 'es' ? 'Error cargando video' : 'Error loading video'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl -z-10 opacity-50" />
          </div>
        </div>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </section>
  )
}
