"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useLandingLanguage } from "@/contexts/landing-language-context"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLandingLanguage()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: t.nav.features, href: "#features" },
    { label: t.nav.pricing, href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="#" className="text-2xl font-bold text-foreground">
            Blok
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-foreground" />
                ) : (
                  <Moon className="h-4 w-4 text-foreground" />
                )}
              </button>
            )}

            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setLanguage("es")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  language === "es" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  language === "en" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.location.href = '/login'}
            >
              {t.nav.login}
            </Button>
            <Button
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90"
              onClick={() => window.location.href = '/signup'}
            >
              {t.nav.signup}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-foreground">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-2 pt-2">
                {/* Theme Toggle Mobile */}
                {mounted && (
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 text-foreground" />
                    ) : (
                      <Moon className="h-4 w-4 text-foreground" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => setLanguage("es")}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    language === "es" ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  ES
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    language === "en" ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  EN
                </button>
              </div>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => window.location.href = '/login'}
              >
                {t.nav.login}
              </Button>
              <Button
                className="bg-foreground text-background hover:bg-foreground/90 w-full"
                onClick={() => window.location.href = '/signup'}
              >
                {t.nav.signup}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
