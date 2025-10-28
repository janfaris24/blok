"use client"

import { MapPin, Lightbulb, Linkedin } from "lucide-react"
import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"
import { motion } from "framer-motion"

export function AboutSection() {
  const { t } = useLanguage()

  return (
    <section id="about" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              {t.about.headline}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.about.subheadline}
            </p>
          </motion.div>

          {/* Founder Card */}
          <motion.div
            className="bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid md:grid-cols-[200px,1fr] gap-8 items-start">
              {/* Founder Photo */}
              <div className="mx-auto md:mx-0">
                <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg">
                  <img
                    src="/images/jan-faris-profile.jpeg"
                    alt="Jan Faris - Founder & CEO of Blok"
                    className="w-full h-full object-cover object-[center_15%]"
                  />
                </div>
                <div className="text-center mt-4">
                  <h3 className="text-xl font-bold">{t.about.founder.name}</h3>
                  <p className="text-sm text-muted-foreground">{t.about.founder.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.about.founder.experience}</p>
                  <a
                    href="https://www.linkedin.com/in/jan-faris-garcia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                </div>
              </div>

              {/* Founder Story */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    {t.about.founder.storyTitle}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {t.about.founder.story}
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {t.about.founder.locationTitle}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {t.about.founder.location}
                  </p>
                </div>

                {/* Mission */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm italic text-muted-foreground">
                    "{t.about.founder.mission}"
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
