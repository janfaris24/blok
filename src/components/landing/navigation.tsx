"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useLandingLanguage } from "@/contexts/landing-language-context"
import { WaitlistModal } from "./waitlist-modal"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [waitlistOpen, setWaitlistOpen] = useState(false)
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

  // Open waitlist modal
  const handleWaitlistClick = () => {
    setWaitlistOpen(true)
  }

  const navLinks: Array<{ label: string; href: string; badge?: boolean }> = [
    { label: t.nav.pricing, href: "/pricing" },
    { label: "FAQ", href: "/faq" },
    { label: t.nav.feedback, href: "/feedback", badge: true },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
      <div
        className={`container mx-auto transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-lg border border-border/40 shadow-lg shadow-black/5"
            : "bg-background/60 backdrop-blur-md border border-border/20"
        } rounded-2xl sm:rounded-full`}
      >
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="Blok"
              className="w-10 h-10 sm:w-11 sm:h-11"
            />
            <span className="text-2xl font-bold text-foreground">Blok</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  link.badge
                    ? "text-primary font-medium hover:text-primary/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {link.badge && <span className="ml-1.5 text-xs">✨</span>}
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
              onClick={handleWaitlistClick}
            >
              {t.nav.waitlist}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-foreground">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 px-4 border-t border-border/20">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${
                    link.badge
                      ? "text-primary font-medium hover:text-primary/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                  {link.badge && <span className="ml-1.5 text-xs">✨</span>}
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
                onClick={handleWaitlistClick}
              >
                {t.nav.waitlist}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </nav>
  )
}
