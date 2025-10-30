'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLandingLanguage } from '@/contexts/landing-language-context';
import { Loader2 } from 'lucide-react';

export function ScrollVideoDemo() {
  const { language } = useLandingLanguage();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Subtle zoom: starts slightly small (0.9), grows to normal (1.0) at peak
  const scale = useTransform(scrollYProgress,
    [0, 0.5, 1],
    [0.9, 1.0, 0.95]
  );

  const opacity = useTransform(scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0.8]
  );

  // Lazy load video when component comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadVideo) {
            setShouldLoadVideo(true);
          }
        });
      },
      {
        rootMargin: '200px',
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [shouldLoadVideo]);

  // Control video playback based on visibility
  useEffect(() => {
    if (!videoRef.current || !videoLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(videoRef.current);

    return () => {
      observer.disconnect();
    };
  }, [videoLoaded]);

  // Handle video load events
  const handleVideoLoad = () => {
    setVideoLoaded(true);
    // Auto-play after load
    videoRef.current?.play().catch(() => {});
  };

  return (
    <section
      id="demo"
      ref={containerRef}
      className="relative py-24 sm:py-32 lg:py-40 overflow-hidden bg-background"
    >
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-foreground">
            {language === 'es'
              ? 'Únete a la Lista de Espera'
              : 'Join the Waitlist'
            }
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'es'
              ? 'Sé de los primeros en transformar la gestión de tu condominio con IA'
              : 'Be among the first to transform your condo management with AI'
            }
          </p>
        </motion.div>

        {/* Borderless, clean video - Intercom style */}
        <motion.div
          style={{ scale, opacity }}
          className="relative mx-auto max-w-6xl"
        >
          <div className="relative aspect-video bg-muted overflow-hidden shadow-2xl rounded-xl">
            {/* Loading Placeholder */}
            {!videoLoaded && shouldLoadVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-foreground animate-spin mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {language === 'es' ? 'Cargando demo...' : 'Loading demo...'}
                  </p>
                </div>
              </div>
            )}

            {/* Video - Lazy loaded */}
            {shouldLoadVideo && (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className={`w-full h-full object-cover transition-opacity duration-700 ${
                  videoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoadedData={handleVideoLoad}
                onCanPlay={handleVideoLoad}
                onError={(e) => {
                  console.error('Video load error:', e);
                  setVideoLoaded(true); // Show video anyway to prevent infinite loading
                }}
              >
                <source src="/videos/blok-demo-compressed.mp4" type="video/mp4" />
                {language === 'es'
                  ? 'Tu navegador no soporta videos.'
                  : 'Your browser does not support videos.'
                }
              </video>
            )}

            {/* Fallback for before video loads */}
            {!shouldLoadVideo && (
              <div className="absolute inset-0 bg-muted" />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
