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
import { Loader2, CheckCircle2 } from "lucide-react"
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
  const [role, setRole] = useState("")
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
    roleLabel: "Rol (Opcional)",
    rolePlaceholder: "Selecciona tu rol",
    roleOwner: "Propietario",
    roleRenter: "Inquilino",
    roleAdmin: "Administrador/Junta",
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
    roleLabel: "Role (Optional)",
    rolePlaceholder: "Select your role",
    roleOwner: "Owner",
    roleRenter: "Renter",
    roleAdmin: "Administrator/Board",
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
          role: role || null,
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
      setRole("")

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
      <DialogContent className="sm:max-w-[440px] mx-4 sm:mx-0 p-0 max-h-[95vh] overflow-y-auto">
        {!isSuccess ? (
          <>
            <div className="p-6 sm:p-7 pb-0">
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-2xl font-bold">
                  {t.title}
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  {t.description}
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-7 pt-5 space-y-6">
              {/* Email - Primary Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  {t.emailLabel} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-14 text-base px-4 border-2 focus:border-primary"
                  required
                  autoFocus
                />
              </div>

              {/* Optional Details Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground font-medium">
                    {language === 'es' ? 'Opcional' : 'Optional'}
                  </span>
                </div>
              </div>

              {/* Optional Fields - Compact Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Name */}
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                      {t.nameLabel}
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t.namePlaceholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      className="h-11 text-sm"
                    />
                  </div>

                  {/* Phone & Role in same row */}
                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-xs font-medium text-muted-foreground">
                      {t.roleLabel}
                    </Label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={isLoading}
                      className="w-full h-11 px-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">{language === 'es' ? 'Rol' : 'Role'}</option>
                      <option value="owner">{language === 'es' ? 'Dueño' : 'Owner'}</option>
                      <option value="renter">{language === 'es' ? 'Inquilino' : 'Renter'}</option>
                      <option value="admin">{language === 'es' ? 'Admin' : 'Admin'}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
                      {t.phoneLabel}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="787-555-1234"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isLoading}
                      className="h-11 text-sm"
                    />
                  </div>

                  {/* Building */}
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="building" className="text-xs font-medium text-muted-foreground">
                      {t.buildingLabel}
                    </Label>
                    <Input
                      id="building"
                      type="text"
                      placeholder={t.buildingPlaceholder}
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      disabled={isLoading}
                      className="h-11 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3.5 rounded-lg text-sm leading-relaxed">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-foreground text-background hover:bg-foreground/90 mt-2"
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
          <div className="py-12 text-center px-4">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            </div>
            <DialogTitle className="text-2xl mb-4">{t.successTitle}</DialogTitle>
            <DialogDescription className="text-base mb-8 leading-relaxed">
              {t.successMessage}
            </DialogDescription>
            <Button
              onClick={() => handleClose(false)}
              className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8"
            >
              {t.closeButton}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
