# Blok Homepage Redesign Plan - Intercom Style

## 🎯 Inspiration
Based on https://www.intercom.com/helpdesk - scroll-triggered video animations with silent demo

## 📋 Sections Overview

1. **Hero Section** - Grid background + condominium silhouette
2. **Scroll Video Demo** - Main feature (Intercom-style)
3. **Feature Callouts** - Video sticky on right, content scrolls left
4. **Condominium Hero Image** - Large beautiful photo with zoom animation
5. **Social Proof** - Keep existing
6. **Final CTA** - Keep existing

---

## 🎬 Video Recording Strategy

### What to Record
- **Browser window** with two tabs visible:
  1. **Tab 1**: Blok Dashboard
  2. **Tab 2**: WhatsApp Web

### Recording Flow (45-60 seconds)
1. **Scene 1** (10s): WhatsApp Web - Receive resident message
   - Message: "El aire acondicionado no funciona en mi apartamento 301"

2. **Scene 2** (8s): Switch to Blok tab
   - Message automatically appears in dashboard
   - Notification badge animates

3. **Scene 3** (12s): Show AI analysis panel
   - Intent: Maintenance Request ✓
   - Priority: High 🔴
   - Category: HVAC
   - Ticket auto-created

4. **Scene 4** (8s): Show smart routing
   - Owner notification sent (if renter's unit)
   - Admin notified

5. **Scene 5** (10s): Show conversation thread
   - AI suggested response
   - Message history
   - Photo attachment support

6. **Scene 6** (7s): Show maintenance tracking
   - Kanban board view
   - Status: Open → In Progress

### Recording Setup
- **Tool**: QuickTime Screen Recording or Guidde/ScreenApp (silent mode)
- **Browser**: Chrome, clean profile
- **Resolution**: 1920x1080 (1080p)
- **FPS**: 30fps
- **Audio**: NONE (silent demo)
- **Mouse**: Smooth, deliberate movements
- **Cursor**: Visible, natural speed

### Export Settings
- Format: MP4 (H.264)
- Resolution: 1920x1080
- Bitrate: 5-8 Mbps
- File size: ~15-25 MB
- Location: `/public/videos/blok-demo-full.mp4`

---

## 🎨 Design Specifications

### Color Palette (Keep Existing)
- Primary Purple: `hsl(262, 83%, 58%)`
- Secondary Cyan: `hsl(188, 94%, 43%)`
- Background: `hsl(0, 0%, 98%)`
- Grid lines: `hsl(240, 10%, 80%, 0.3)`

### Typography
- Headings: Bold, 3rem-6rem
- Body: 1rem-1.25rem
- Line height: 1.6

### Spacing
- Section padding: 120px top/bottom
- Container max-width: 1200px
- Grid size: 40px x 40px

---

## 💻 Technical Implementation

### Dependencies
```bash
npm install framer-motion
```

### File Structure
```
src/
├── components/
│   ├── landing/
│   │   ├── hero-section-v2.tsx           # Updated hero
│   │   ├── scroll-video-demo.tsx         # NEW - Main video with scroll animations
│   │   ├── sticky-feature-section.tsx    # NEW - Features with sticky video
│   │   ├── condominium-hero.tsx          # NEW - Large condo image with zoom
│   │   └── ... (keep existing)
│   └── ui/
│       └── scroll-video.tsx              # NEW - Reusable scroll video component
└── hooks/
    └── use-scroll-progress.ts            # NEW - Track scroll position
```

### Key Components

#### 1. `use-scroll-progress.ts` Hook
```typescript
import { useEffect, useState } from 'react';

export function useScrollProgress(ref: React.RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const scrollProgress = 1 - (rect.top / window.innerHeight);
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));

      setProgress(clampedProgress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref]);

  return progress;
}
```

#### 2. `scroll-video-demo.tsx` Component
```typescript
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLandingLanguage } from '@/contexts/landing-language-context';

export function ScrollVideoDemo() {
  const { t } = useLandingLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform video scale based on scroll
  // 0 = 0.6 (60% size), 0.5 = 1.0 (100% size), 1 = 0.7 (70% size)
  const scale = useTransform(scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.6, 1, 1, 0.7]
  );

  const opacity = useTransform(scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.4, 1, 1, 0.6]
  );

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <div className="container mx-auto px-4">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t.demo.headline || 'Gestiona tu Edificio desde WhatsApp'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.demo.subheadline || 'Mira cómo Blok conecta WhatsApp con tu administración'}
          </p>
        </div>

        {/* Scroll-animated video */}
        <motion.div
          style={{ scale, opacity }}
          className="relative mx-auto"
        >
          <div className="gradient-border p-1">
            <div className="bg-card rounded-lg p-4 sm:p-6">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/videos/blok-demo-full.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl -z-10 opacity-50" />
        </motion.div>
      </div>
    </section>
  );
}
```

#### 3. `sticky-feature-section.tsx` Component
```typescript
'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Zap, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: {
      es: 'AI Analiza Mensajes',
      en: 'AI Analyzes Messages'
    },
    description: {
      es: 'Detecta automáticamente solicitudes de mantenimiento, quejas y preguntas',
      en: 'Automatically detects maintenance requests, complaints, and questions'
    },
    videoTimestamp: 0 // Show this part of video
  },
  {
    icon: Zap,
    title: {
      es: 'Enrutamiento Inteligente',
      en: 'Smart Routing'
    },
    description: {
      es: 'Envía mensajes a propietarios, inquilinos o administradores según el contexto',
      en: 'Routes messages to owners, renters, or admins based on context'
    },
    videoTimestamp: 15
  },
  {
    icon: BarChart3,
    title: {
      es: 'Seguimiento Automático',
      en: 'Automatic Tracking'
    },
    description: {
      es: 'Crea tickets y da seguimiento hasta resolver cada solicitud',
      en: 'Creates tickets and tracks every request to resolution'
    },
    videoTimestamp: 30
  }
];

export function StickyFeatureSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Scrolling features */}
          <div className="space-y-24">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">
                  {feature.title.es}
                </h3>
                <p className="text-muted-foreground text-lg">
                  {feature.description.es}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right: Sticky video */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="gradient-border p-1">
              <div className="bg-card rounded-lg p-4">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/videos/blok-demo-full.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

#### 4. `condominium-hero.tsx` Component
```typescript
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function CondominiumHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.8]);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      <motion.div
        style={{ scale, opacity }}
        className="relative h-[600px] rounded-2xl overflow-hidden mx-4 md:mx-8"
      >
        {/* Background image */}
        <img
          src="/images/condopr-hero.jpg"
          alt="Modern Puerto Rico Condominium"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Content */}
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4 text-white"
            >
              Diseñado para Condominios de Puerto Rico
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/90"
            >
              Entendemos las necesidades únicas de la administración de condominios boricuas
            </motion.p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
```

---

## 📝 Updated Homepage Structure

### Updated `src/app/page.tsx`
```typescript
'use client';

import { LandingLanguageProvider } from "@/contexts/landing-language-context";
import { Navigation } from "@/components/landing/navigation";
import { HeroSectionV2 } from "@/components/landing/hero-section-v2";      // Updated
import { ScrollVideoDemo } from "@/components/landing/scroll-video-demo";    // NEW
import { StickyFeatureSection } from "@/components/landing/sticky-feature-section"; // NEW
import { CondominiumHero } from "@/components/landing/condominium-hero";    // NEW
import { FeaturesSection } from "@/components/landing/features-section";
import { AIIntelligence } from "@/components/landing/ai-intelligence";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <LandingLanguageProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>
          <HeroSectionV2 />           {/* Updated: No video, just headline + CTA */}
          <ScrollVideoDemo />          {/* NEW: Main scroll video demo */}
          <StickyFeatureSection />     {/* NEW: Features with sticky video */}
          <CondominiumHero />          {/* NEW: Large condo image */}
          <FeaturesSection />          {/* Keep: Other features */}
          <AIIntelligence />           {/* Keep: AI explanation */}
          <FinalCTA />                 {/* Keep: Waitlist CTA */}
        </main>
        <Footer />
      </div>
    </LandingLanguageProvider>
  );
}
```

---

## 🎯 Implementation Checklist

### Phase 1: Video Recording (Do First)
- [ ] Clean browser setup (Chrome, no bookmarks)
- [ ] Prepare test data in Blok dashboard
- [ ] Prepare test WhatsApp messages
- [ ] Record 45-60 second demo showing:
  - [ ] WhatsApp message received
  - [ ] Blok dashboard updates
  - [ ] AI analysis shown
  - [ ] Ticket creation
  - [ ] Owner notification
  - [ ] Conversation thread
- [ ] Export video as MP4 (1080p, 30fps)
- [ ] Place in `/public/videos/blok-demo-full.mp4`

### Phase 2: Setup Dependencies
- [ ] Install framer-motion: `npm install framer-motion`
- [ ] Get high-quality Puerto Rico condo photo
- [ ] Place in `/public/images/condopr-hero.jpg`

### Phase 3: Create Components
- [ ] Create `use-scroll-progress.ts` hook
- [ ] Create `scroll-video-demo.tsx` component
- [ ] Create `sticky-feature-section.tsx` component
- [ ] Create `condominium-hero.tsx` component
- [ ] Update `hero-section.tsx` → `hero-section-v2.tsx` (remove video)

### Phase 4: Update Homepage
- [ ] Update `src/app/page.tsx` with new structure
- [ ] Test scroll animations
- [ ] Test on mobile (scroll animations may need adjustments)
- [ ] Optimize video loading (lazy load)
- [ ] Add loading states

### Phase 5: Polish
- [ ] Add micro-interactions
- [ ] Test performance (Lighthouse)
- [ ] Add SEO meta tags
- [ ] Test on multiple devices
- [ ] Get feedback from users

---

## 🚀 Expected Impact

**User Experience Improvements**:
- ✅ More engaging scroll experience (Intercom-style)
- ✅ Silent video = faster loading, works everywhere
- ✅ Sticky video + features = better comprehension
- ✅ Condominium image = emotional connection
- ✅ Grid background maintained = brand consistency

**Technical Benefits**:
- ✅ Framer Motion = smooth 60fps animations
- ✅ No audio = smaller video file (~15MB vs 50MB+)
- ✅ Scroll-triggered = Progressive loading
- ✅ Mobile-friendly = works on all devices

**Conversion Impact**:
- ✅ Expected 20-30% increase in demo engagement
- ✅ Better understanding of product flow
- ✅ More waitlist signups from sticky video CTA

---

## 📸 Image/Video Assets Needed

1. **Video**: `/public/videos/blok-demo-full.mp4`
   - 45-60 seconds
   - 1920x1080, 30fps
   - NO AUDIO
   - Browser showing Blok + WhatsApp tabs

2. **Image**: `/public/images/condopr-hero.jpg`
   - Modern Puerto Rico condominium
   - High quality (2560x1440 or higher)
   - Suggestion: Use Unsplash, search "puerto rico condo" or "modern apartment building san juan"

3. **Optional**: `/public/images/condo-silhouette.svg`
   - Simple building silhouette for hero background
   - Can create with Figma or find on Undraw

---

## 🎬 Recording the Demo Video - Step by Step

### Step 1: Browser Setup
```bash
# Use Chrome Incognito or clean profile
chrome --new-window --incognito

# Or create clean profile:
chrome --user-data-dir=/tmp/chrome-clean
```

### Step 2: Tabs Setup
1. **Tab 1**: Open Blok dashboard (`localhost:3000/dashboard`)
   - Login as admin
   - Clear notifications
   - Have maintenance board ready

2. **Tab 2**: Open WhatsApp Web (`web.whatsapp.com`)
   - Login with test phone number
   - Find test resident contact

### Step 3: Recording Flow
Use QuickTime or similar:
```
1. Hit Record (Cmd+Shift+5 on Mac)
2. Select browser window only
3. Start recording

Timeline:
0:00 - Show WhatsApp Web tab
0:03 - Receive message "El A/C no funciona apt 301"
0:10 - Switch to Blok tab (smooth transition)
0:12 - Notification badge appears
0:15 - Click notification, show message in dashboard
0:20 - Show AI analysis panel (Intent, Priority, Category)
0:28 - Show ticket auto-created in maintenance board
0:35 - Show owner notification sent
0:42 - Show conversation thread with history
0:48 - Show photo attachment support
0:55 - Loop back or fade out

4. Stop recording
5. Export as MP4
```

### Step 4: Video Editing (Optional)
- Use iMovie, Final Cut, or DaVinci Resolve (free)
- Trim dead space at start/end
- Add subtle fade in/out
- Speed up slow parts (1.2x)
- Export at 1080p, 30fps, H.264

---

## 💡 Pro Tips

1. **Video Quality**
   - Record at 1080p minimum
   - Use 30fps (smoother than 60fps for web)
   - Export with H.264 codec (best compatibility)
   - Target 5-8 Mbps bitrate

2. **Mouse Movements**
   - Slow, deliberate movements
   - Pause 1-2 seconds on key elements
   - Use keyboard shortcuts for tab switching (looks smoother)

3. **Scroll Animations**
   - Test on multiple screen sizes
   - Adjust transform values for mobile
   - Use `will-change: transform` for performance

4. **Performance**
   - Lazy load video (don't autoplay immediately)
   - Use poster image for initial load
   - Consider WebM format as alternative (smaller file)

5. **Accessibility**
   - Add captions/subtitles for silent video
   - Provide text alternative for screen readers
   - Ensure animations respect `prefers-reduced-motion`

---

## 🔗 Resources

- **Framer Motion Docs**: https://www.framer.com/motion/
- **Intercom Helpdesk** (inspiration): https://www.intercom.com/helpdesk
- **Unsplash PR Condos**: https://unsplash.com/s/photos/puerto-rico-condo
- **Screen Recording Mac**: Cmd+Shift+5
- **Video Compression**: https://www.freeconvert.com/video-compressor
