'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function BrandVideoSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    videoRef.current?.play().catch(() => {});
  };

  return (
    <section
      ref={containerRef}
      className="relative py-20 sm:py-32 overflow-hidden bg-background"
    >
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Minimalist centered video container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto"
        >
          {/* Video container with subtle shadow */}
          <div className="relative aspect-video bg-muted/30 overflow-hidden rounded-2xl shadow-2xl border border-border/50">
            {/* Lazy loaded video */}
            {shouldLoadVideo && (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className={`w-full h-full object-cover transition-opacity duration-1000 ${
                  videoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoadedData={handleVideoLoad}
                onCanPlay={handleVideoLoad}
                onError={(e) => {
                  console.error('Video load error:', e);
                  setVideoLoaded(true);
                }}
              >
                <source src="/videos/blok-street-sign-video.mp4" type="video/mp4" />
              </video>
            )}

            {/* Loading state */}
            {!videoLoaded && shouldLoadVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30 backdrop-blur-sm">
                <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
              </div>
            )}

            {/* Fallback before load */}
            {!shouldLoadVideo && (
              <div className="absolute inset-0 bg-muted/30" />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
