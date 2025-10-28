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
      { label: t.footer.links.about, href: "#about" },
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

          {/* Contact Information */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-3">{t.footer.contact.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">{t.footer.contact.address}</strong><br />
                    San Juan, PR 00925<br />
                    Puerto Rico
                  </p>
                  <p>
                    <strong className="text-foreground">{t.footer.contact.website}</strong>{" "}
                    <a
                      href="https://www.blokpr.co/"
                      className="hover:text-foreground transition-colors underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      www.blokpr.co
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">{t.footer.about.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">{t.footer.about.founder}</strong> Jan Faris
                  </p>
                  <p>{t.footer.about.description}</p>
                </div>
              </div>
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
