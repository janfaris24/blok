'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { LandingLanguageProvider, useLandingLanguage } from '@/contexts/landing-language-context';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const { t, language, setLanguage } = useLandingLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(language === 'es' ? 'Error al enviar el correo' : 'Error sending email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/80 to-background pointer-events-none" />

      {/* Back to login link + Language toggle */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between">
        <button
          onClick={() => router.push('/login')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'es' ? 'Volver al inicio de sesión' : 'Back to login'}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setLanguage('es')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              language === 'es'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ES
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              language === 'en'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Forgot Password Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-5">
              <img
                src="/favicon.svg"
                alt="Blok"
                className="w-20 h-20"
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {language === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot Your Password?'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'es'
                ? 'Te enviaremos un enlace para restablecerla'
                : "We'll send you a link to reset it"}
            </p>
          </div>

          {/* Form Card */}
          <div className="gradient-border p-1">
            <div className="bg-card rounded-lg p-6">
              {success ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200 text-center">
                      {language === 'es'
                        ? '¡Correo enviado! Revisa tu bandeja de entrada.'
                        : 'Email sent! Check your inbox.'}
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/login')}
                    variant="outline"
                    className="w-full"
                  >
                    {language === 'es' ? 'Volver al inicio de sesión' : 'Back to login'}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs">
                      {language === 'es' ? 'Correo Electrónico' : 'Email'}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@edificio.com"
                      required
                      className="h-9"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-xs text-destructive">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 bg-foreground text-background hover:bg-foreground/90"
                    disabled={loading}
                  >
                    {loading
                      ? (language === 'es' ? 'Enviando...' : 'Sending...')
                      : (language === 'es' ? 'Enviar enlace' : 'Send reset link')
                    }
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <LandingLanguageProvider>
      <ForgotPasswordForm />
    </LandingLanguageProvider>
  );
}
