'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { LandingLanguageProvider, useLandingLanguage } from '@/contexts/landing-language-context';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { language, setLanguage } = useLandingLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError(language === 'es' ? 'Por favor ingresa tu correo electrónico' : 'Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMagicLinkSent(true);
      }
    } catch (err) {
      setError(language === 'es' ? 'Error al enviar el enlace' : 'Error sending magic link');
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

      {/* Back to home link + Language toggle */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'es' ? 'Volver al inicio' : 'Back to home'}
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

      {/* Login Form */}
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
              {language === 'es' ? 'Bienvenido a Blok' : 'Welcome to Blok'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'es' ? 'Inicia sesión en tu cuenta' : 'Log in to your account'}
            </p>
          </div>

          {/* Form Card */}
          <div className="gradient-border p-1">
            <div className="bg-card rounded-lg p-6">
              <form onSubmit={handleLogin} className="space-y-4">
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

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs">
                      {language === 'es' ? 'Contraseña' : 'Password'}
                    </Label>
                    <button
                      type="button"
                      onClick={() => router.push('/forgot-password')}
                      className="text-xs text-primary hover:underline"
                    >
                      {language === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot password?'}
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                    ? (language === 'es' ? 'Iniciando sesión...' : 'Logging in...')
                    : (language === 'es' ? 'Iniciar Sesión' : 'Log In')
                  }
                </Button>
              </form>

              {/* Magic Link Section */}
              {magicLinkSent ? (
                <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-800 dark:text-green-200 text-center">
                    {language === 'es'
                      ? '¡Enlace enviado! Revisa tu correo electrónico.'
                      : 'Link sent! Check your email.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">
                      {language === 'es' ? 'O' : 'OR'}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <Button
                    type="button"
                    onClick={handleMagicLink}
                    variant="outline"
                    className="w-full h-10 mt-4"
                    disabled={loading}
                  >
                    {language === 'es' ? 'Enviar enlace mágico' : 'Send magic link'}
                  </Button>
                </>
              )}

              {/* Signup link */}
              <div className="mt-4 pt-4 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  {language === 'es' ? '¿No tienes una cuenta? ' : "Don't have an account? "}
                  <button
                    onClick={() => router.push('/signup')}
                    className="text-primary hover:underline font-medium"
                  >
                    {language === 'es' ? 'Regístrate gratis' : 'Sign up free'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <LandingLanguageProvider>
      <LoginForm />
    </LandingLanguageProvider>
  );
}
