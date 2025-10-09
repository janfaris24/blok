'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, MapPin, Hash, Phone, Check, Upload, FileSpreadsheet } from 'lucide-react';

export default function OnboardingSetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    address: '',
    city: 'San Juan',
    totalUnits: '',
    whatsappBusinessNumber: '',
  });

  const totalSteps = 4;

  const handleNext = () => {
    setError('');

    // Validate current step
    if (step === 1 && !formData.address) {
      setError('Por favor ingresa la dirección del edificio');
      return;
    }

    if (step === 2) {
      const units = parseInt(formData.totalUnits);
      if (!formData.totalUnits || isNaN(units) || units < 1 || units > 500) {
        setError('Por favor ingresa un número válido de unidades (1-500)');
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Complete onboarding
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: formData.address,
          totalUnits: parseInt(formData.totalUnits),
          whatsappBusinessNumber: formData.whatsappBusinessNumber || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al completar la configuración');
        return;
      }

      // Step 2: Upload CSV if provided
      if (csvFile) {
        const csvFormData = new FormData();
        csvFormData.append('file', csvFile);

        const csvResponse = await fetch('/api/residents/import', {
          method: 'POST',
          body: csvFormData,
        });

        const csvData = await csvResponse.json();

        if (!csvResponse.ok) {
          console.error('CSV import error:', csvData);
          // Don't block - just log the error
        } else {
          console.log('CSV imported:', csvData);
        }
      }

      // Success! Redirect to dashboard
      router.push('/dashboard');
      router.refresh();

    } catch (err) {
      setError('Error al completar la configuración');
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = Math.round((step / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configura tu edificio
          </h1>
          <p className="text-muted-foreground">
            Solo te tomará unos minutos
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              Paso {step} de {totalSteps}
            </span>
            <span className="text-sm font-medium text-foreground">
              {progressPercentage}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-lg p-8">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Ubicación del edificio</h2>
                  <p className="text-sm text-muted-foreground">
                    ¿Dónde está ubicado tu condominio?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección completa</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Calle Principal, Urbanización..."
                    className="h-12"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="San Juan"
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Total Units */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Unidades residenciales</h2>
                  <p className="text-sm text-muted-foreground">
                    ¿Cuántas unidades tiene tu edificio?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalUnits">Número total de unidades</Label>
                  <Input
                    id="totalUnits"
                    type="number"
                    min="1"
                    max="500"
                    value={formData.totalUnits}
                    onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                    placeholder="50"
                    className="h-12 text-lg"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Generaremos las unidades automáticamente (ejemplo: 101, 102, 103...)
                  </p>
                </div>

                {formData.totalUnits && parseInt(formData.totalUnits) > 0 && (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                    <p className="text-sm text-foreground">
                      Se crearán <span className="font-semibold">{formData.totalUnits}</span> unidades
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: WhatsApp (Optional) */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">WhatsApp Business</h2>
                  <p className="text-sm text-muted-foreground">
                    Conecta tu número de WhatsApp (opcional)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">Número de WhatsApp Business</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={formData.whatsappBusinessNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappBusinessNumber: e.target.value })}
                    placeholder="+1 787 555 0123"
                    className="h-12"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: +1 787 XXX XXXX (Puerto Rico)
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <span className="font-medium">Puedes configurar esto más tarde</span> en la configuración del edificio
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Import Residents (Optional) */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Importar Residentes</h2>
                  <p className="text-sm text-muted-foreground">
                    Sube un archivo CSV con la información de tus residentes
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Formato del archivo CSV:
                  </p>
                  <code className="text-xs text-muted-foreground block bg-muted p-2 rounded">
                    tipo,nombre,apellido,email,telefono,numero_unidad
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    Ejemplo: owner,Juan,Pérez,juan@email.com,7871234567,101
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csv-upload">Archivo CSV</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCsvFile(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="csv-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {csvFile ? (
                        <>
                          <FileSpreadsheet className="w-8 h-8 text-primary" />
                          <p className="text-sm font-medium text-foreground">{csvFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(csvFile.size / 1024).toFixed(2)} KB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <p className="text-sm font-medium text-foreground">
                            Haz clic para subir o arrastra el archivo
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Archivo CSV (máx. 5MB)
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                  {csvFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCsvFile(null)}
                      className="w-full"
                    >
                      Eliminar archivo
                    </Button>
                  )}
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <span className="font-medium">Paso opcional</span> - Puedes agregar residentes manualmente después desde el dashboard
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || loading}
              className="h-12 px-6"
            >
              Atrás
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={loading}
                className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90"
              >
                Continuar
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90"
              >
                {loading ? 'Completando...' : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Completar configuración
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Necesitas ayuda? Contáctanos en{' '}
          <a href="mailto:soporte@blok.app" className="text-primary hover:underline">
            soporte@blok.app
          </a>
        </p>
      </div>
    </div>
  );
}
