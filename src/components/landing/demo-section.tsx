"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function DemoSection() {
  const { t, language } = useLanguage()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [])

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm font-medium gradient-text">
              {language === 'es' ? 'VE BLOK EN ACCIÓN' : 'SEE BLOK IN ACTION'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            {language === 'es'
              ? 'Gestión de condominios nunca fue tan simple'
              : 'Condo management has never been this simple'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'es'
              ? 'Mira cómo Blok transforma la comunicación y administración de tu condominio en minutos'
              : 'Watch how Blok transforms your condo communication and management in minutes'}
          </p>
        </div>

        {/* Video Player */}
        <div className="max-w-6xl mx-auto">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />

            {/* Video container */}
            <div className="relative bg-card rounded-2xl overflow-hidden border-2 border-border/50 shadow-2xl">
              <div className="relative aspect-video bg-black">
                {/* Loading state */}
                {!videoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/10 z-10">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-sm text-white/70">
                        {language === 'es' ? 'Cargando demo...' : 'Loading demo...'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Video */}
                <video
                  ref={videoRef}
                  className={`w-full h-full transition-opacity duration-500 ${
                    videoLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoadedData={() => setVideoLoaded(true)}
                  onCanPlayThrough={() => setVideoLoaded(true)}
                  onClick={togglePlay}
                  playsInline
                  muted={isMuted}
                >
                  <source src="/videos/BLOK-DEMO.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Custom controls overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20">
                  <button
                    onClick={togglePlay}
                    className="w-20 h-20 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all transform hover:scale-110 shadow-2xl"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
                    ) : (
                      <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
                    )}
                  </button>
                </div>

                {/* Bottom controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-white" fill="white" />
                        ) : (
                          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                        )}
                      </button>

                      <button
                        onClick={toggleMute}
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={toggleFullscreen}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      aria-label="Fullscreen"
                    >
                      <Maximize className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature highlights below video */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {language === 'es' ? 'WhatsApp Nativo' : 'Native WhatsApp'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'es'
                  ? 'Residentes escriben desde WhatsApp. AI responde al instante.'
                  : 'Residents text from WhatsApp. AI responds instantly.'}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {language === 'es' ? 'AI Inteligente' : 'Smart AI'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'es'
                  ? 'Detecta mantenimiento, urgencias, y enruta automáticamente.'
                  : 'Detects maintenance, emergencies, and routes automatically.'}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {language === 'es' ? 'Dashboard Completo' : 'Complete Dashboard'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'es'
                  ? 'Ve todo desde un solo lugar. Conversaciones, tareas, anuncios.'
                  : 'See everything from one place. Conversations, tasks, broadcasts.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
