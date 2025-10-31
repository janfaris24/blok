"use client"

import { useState, useRef, useEffect } from "react"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function Footer() {
  const { t } = useLanguage()
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  // Lazy load video when footer comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadVideo) {
            setShouldLoadVideo(true)
          }
        })
      },
      {
        rootMargin: '200px',
        threshold: 0.1
      }
    )

    if (footerRef.current) {
      observer.observe(footerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [shouldLoadVideo])

  // Auto-play video when loaded
  useEffect(() => {
    if (videoRef.current && videoLoaded) {
      videoRef.current.play().catch(() => {})
    }
  }, [videoLoaded])

  const handleVideoLoad = () => {
    setVideoLoaded(true)
  }

  const footerLinks = {
    producto: [
      { label: t.footer.links.features, href: "/features" },
      { label: t.footer.links.pricing, href: "/pricing" },
    ],
    empresa: [
      { label: t.footer.links.about, href: "#about" },
      { label: t.footer.links.blog, href: "#" },
    ],
    legal: [
      { label: t.footer.links.privacy, href: "/privacy" },
      { label: t.footer.links.terms, href: "/terms" },
    ],
  }

  return (
    <footer ref={footerRef} className="relative border-t border-border py-12 sm:py-16 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        {shouldLoadVideo && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="/images/blok-footer.png"
            className="absolute inset-0 w-full h-full object-cover"
            onLoadedData={handleVideoLoad}
            onCanPlay={handleVideoLoad}
          >
            <source src="/videos/blok-footer-video.mp4" type="video/mp4" />
          </video>
        )}

        {/* Fallback poster if video hasn't loaded */}
        {!shouldLoadVideo && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: 'url(/images/blok-footer.png)' }}
          />
        )}

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/85 to-black/90" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Footer Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="font-semibold text-white mb-4">{t.footer.product}</h3>
              <ul className="space-y-3">
                {footerLinks.producto.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">{t.footer.company}</h3>
              <ul className="space-y-3">
                {footerLinks.empresa.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">{t.footer.legal}</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-white mb-3">{t.footer.contact.title}</h3>
                <div className="space-y-2 text-sm text-white/70">
                  <p>
                    <strong className="text-white">{t.footer.contact.address}</strong><br />
                    San Juan, PR 00925<br />
                    Puerto Rico
                  </p>
                  <p>
                    <strong className="text-white">{t.footer.contact.website}</strong>{" "}
                    <a
                      href="https://www.blokpr.co/"
                      className="hover:text-white transition-colors underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      www.blokpr.co
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-3">{t.footer.about.title}</h3>
                <div className="space-y-2 text-sm text-white/70">
                  <p>
                    <strong className="text-white">{t.footer.about.founder}</strong> Jan Faris
                  </p>
                  <p>{t.footer.about.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">Blok</span>
              <span className="text-sm text-white/70">- {t.footer.description}</span>
            </div>
            <p className="text-sm text-white/70">© 2025 Blok. {t.footer.rights}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
