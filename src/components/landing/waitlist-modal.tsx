"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, CheckCircle2, Mail } from "lucide-react"
import { useLandingLanguage } from "@/contexts/landing-language-context"

interface WaitlistModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const { language } = useLandingLanguage()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [building, setBuilding] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = language === 'es' ? {
    title: "Únete a la Lista de Espera",
    description: "Sé de los primeros en acceder a Blok cuando lancemos. Te notificaremos por correo.",
    emailLabel: "Correo Electrónico",
    emailPlaceholder: "tu@email.com",
    nameLabel: "Nombre (Opcional)",
    namePlaceholder: "Tu nombre",
    phoneLabel: "Teléfono (Opcional)",
    phonePlaceholder: "787-555-1234",
    buildingLabel: "Edificio (Opcional)",
    buildingPlaceholder: "Nombre de tu edificio",
    submitButton: "Unirse a la Lista",
    submittingButton: "Enviando...",
    successTitle: "¡Todo listo! 🎉",
    successMessage: "Te hemos enviado un correo de confirmación. Serás de los primeros en saber cuando lancemos.",
    closeButton: "Cerrar",
    emailRequired: "El correo electrónico es requerido",
    emailInvalid: "Por favor ingresa un correo válido",
  } : {
    title: "Join the Waitlist",
    description: "Be among the first to access Blok when we launch. We'll notify you by email.",
    emailLabel: "Email Address",
    emailPlaceholder: "you@email.com",
    nameLabel: "Name (Optional)",
    namePlaceholder: "Your name",
    phoneLabel: "Phone (Optional)",
    phonePlaceholder: "787-555-1234",
    buildingLabel: "Building (Optional)",
    buildingPlaceholder: "Your building name",
    submitButton: "Join Waitlist",
    submittingButton: "Submitting...",
    successTitle: "All set! 🎉",
    successMessage: "We've sent you a confirmation email. You'll be among the first to know when we launch.",
    closeButton: "Close",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate email
    if (!email.trim()) {
      setError(t.emailRequired)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t.emailInvalid)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/waitlist/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null,
          phone: phone.trim() || null,
          building: building.trim() || null,
          language,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al registrarse')
        setIsLoading(false)
        return
      }

      // Success!
      setIsSuccess(true)
      setIsLoading(false)

      // Reset form
      setEmail("")
      setName("")
      setPhone("")
      setBuilding("")

    } catch (err) {
      console.error('Waitlist error:', err)
      setError(language === 'es' ? 'Error al conectar. Intenta de nuevo.' : 'Connection error. Please try again.')
      setIsLoading(false)
    }
  }

  const handleClose = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen)
      // Reset success state when closing
      if (!newOpen) {
        setTimeout(() => setIsSuccess(false), 300)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Mail className="h-6 w-6 text-primary" />
                {t.title}
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                {t.description}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {/* Email (Required) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t.emailLabel} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                  required
                />
              </div>

              {/* Name (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {t.nameLabel}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              {/* Phone (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  {t.phoneLabel}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              {/* Building (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="building" className="text-sm font-medium">
                  {t.buildingLabel}
                </Label>
                <Input
                  id="building"
                  type="text"
                  placeholder={t.buildingPlaceholder}
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-base bg-foreground text-background hover:bg-foreground/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.submittingButton}
                  </>
                ) : (
                  t.submitButton
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-2xl mb-3">{t.successTitle}</DialogTitle>
            <DialogDescription className="text-base mb-6">
              {t.successMessage}
            </DialogDescription>
            <Button
              onClick={() => handleClose(false)}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {t.closeButton}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
