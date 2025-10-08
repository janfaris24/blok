export function Footer() {
  const footerLinks = {
    producto: [
      { label: "Características", href: "#features" },
      { label: "Precios", href: "#pricing" },
      { label: "Demo", href: "#" },
      { label: "Roadmap", href: "#" },
    ],
    empresa: [
      { label: "Sobre Nosotros", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contacto", href: "#contact" },
      { label: "Careers", href: "#" },
    ],
    legal: [
      { label: "Privacidad", href: "#" },
      { label: "Términos", href: "#" },
      { label: "Seguridad", href: "#" },
    ],
    contacto: [
      { label: "Email", href: "mailto:hola@blok.app" },
      { label: "WhatsApp", href: "#" },
      { label: "Twitter/X", href: "#" },
    ],
  }

  return (
    <footer className="border-t border-border py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Footer Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Producto</h3>
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
              <h3 className="font-semibold text-foreground mb-4">Empresa</h3>
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
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
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

            <div>
              <h3 className="font-semibold text-foreground mb-4">Contacto</h3>
              <ul className="space-y-3">
                {footerLinks.contacto.map((link, index) => (
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
              <span className="text-sm text-muted-foreground">- Comunicación IA para Condominios</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Blok. Hecho en Puerto Rico 🇵🇷</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
