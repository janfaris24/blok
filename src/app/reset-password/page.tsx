'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LandingLanguageProvider, useLandingLanguage } from '@/contexts/landing-language-context';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const { language, setLanguage } = useLandingLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(language === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(language === 'es' ? 'La contraseña debe tener al menos 6 caracteres' : 'Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        // Success! Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      setError(language === 'es' ? 'Error al actualizar la contraseña' : 'Error updating password');
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

      {/* Language toggle */}
      <div className="absolute top-6 right-6 z-50">
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

      {/* Reset Password Form */}
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
              {language === 'es' ? 'Nueva Contraseña' : 'New Password'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'es'
                ? 'Ingresa tu nueva contraseña'
                : 'Enter your new password'}
            </p>
          </div>

          {/* Form Card */}
          <div className="gradient-border p-1">
            <div className="bg-card rounded-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs">
                    {language === 'es' ? 'Nueva Contraseña' : 'New Password'}
                  </Label>
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

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-xs">
                    {language === 'es' ? 'Confirmar Contraseña' : 'Confirm Password'}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    ? (language === 'es' ? 'Actualizando...' : 'Updating...')
                    : (language === 'es' ? 'Actualizar contraseña' : 'Update password')
                  }
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <LandingLanguageProvider>
      <ResetPasswordForm />
    </LandingLanguageProvider>
  );
}
