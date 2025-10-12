'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { LandingLanguageProvider, useLandingLanguage } from '@/contexts/landing-language-context';

function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    buildingName: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const { language, setLanguage } = useLandingLanguage();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(language === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError(language === 'es' ? 'La contraseña debe tener al menos 6 caracteres' : 'Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Call our API endpoint to create user + building
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          buildingName: formData.buildingName,
          language: language, // Pass the selected language
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al crear la cuenta');
        return;
      }

      // Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError('Cuenta creada pero no se pudo iniciar sesión. Por favor inicia sesión manualmente.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      // Redirect new users directly to setup
      router.push('/setup');
      router.refresh();

    } catch (err) {
      setError('Error al crear la cuenta');
      console.error('Signup error:', err);
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

      {/* Signup Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {language === 'es' ? 'Únete a Blok' : 'Join Blok'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'es'
                ? 'Cuenta para Administradores • Residentes solo necesitan WhatsApp'
                : 'Admin Account • Residents only need WhatsApp'
              }
            </p>
          </div>

          {/* Form Card */}
          <div className="gradient-border p-1">
            <div className="bg-card rounded-lg p-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="fullName" className="text-xs">
                      {language === 'es' ? 'Nombre Completo' : 'Full Name'}
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={language === 'es' ? 'Juan Pérez' : 'John Doe'}
                      required
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="buildingName" className="text-xs">
                      {language === 'es' ? 'Nombre del Edificio' : 'Building Name'}
                    </Label>
                    <Input
                      id="buildingName"
                      type="text"
                      value={formData.buildingName}
                      onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                      placeholder={language === 'es' ? 'Vista del Mar' : 'Ocean View'}
                      required
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs">
                    {language === 'es' ? 'Correo Electrónico' : 'Email'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@edificio.com"
                    required
                    className="h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-xs">
                      {language === 'es' ? 'Contraseña' : 'Password'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword" className="text-xs">
                      {language === 'es' ? 'Confirmar' : 'Confirm'}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="h-9"
                    />
                  </div>
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
                    ? (language === 'es' ? 'Creando cuenta...' : 'Creating account...')
                    : (language === 'es' ? 'Crear Cuenta Gratis' : 'Create Free Account')
                  }
                </Button>
              </form>

              {/* Login link */}
              <div className="mt-4 pt-4 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  {language === 'es' ? '¿Ya tienes una cuenta? ' : 'Already have an account? '}
                  <button
                    onClick={() => router.push('/login')}
                    className="text-primary hover:underline font-medium"
                  >
                    {language === 'es' ? 'Inicia sesión' : 'Log in'}
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

export default function SignupPage() {
  return (
    <LandingLanguageProvider>
      <SignupForm />
    </LandingLanguageProvider>
  );
}
