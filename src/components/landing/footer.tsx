"use client"

import { useLandingLanguage as useLanguage } from "@/contexts/landing-language-context"

export function Footer() {
  const { t } = useLanguage()

  const footerLinks = {
    producto: [
      { label: t.footer.links.features, href: "#features" },
      { label: t.footer.links.pricing, href: "#pricing" },
    ],
    empresa: [
      { label: t.footer.links.about, href: "#" },
      { label: t.footer.links.blog, href: "#" },
    ],
    legal: [
      { label: t.footer.links.privacy, href: "#" },
      { label: t.footer.links.terms, href: "#" },
    ],
  }

  return (
    <footer className="border-t border-border py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Footer Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="font-semibold text-foreground mb-4">{t.footer.product}</h3>
              <ul className="space-y-3">
                {footerLinks.producto.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">{t.footer.company}</h3>
              <ul className="space-y-3">
                {footerLinks.empresa.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">{t.footer.legal}</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">Blok</span>
              <span className="text-sm text-muted-foreground">- {t.footer.description}</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Blok. {t.footer.rights}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
