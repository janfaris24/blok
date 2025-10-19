'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ResidentRow {
  unit_number: string; // Required
  first_name: string; // Required
  last_name: string; // Required
  email: string; // Optional but recommended (needed for email communications)
  phone: string; // Optional but recommended (needed for WhatsApp)
  whatsapp_number?: string; // Optional
  type: 'owner' | 'renter'; // Optional but recommended (defaults to 'owner')
  opted_in_whatsapp?: boolean;
  opted_in_email?: boolean;
  opted_in_sms?: boolean;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning'; // error = blocks import, warning = just alerts
}

interface BulkImportProps {
  buildingId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BulkImportResidents({ buildingId, open, onClose, onSuccess }: BulkImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ResidentRow[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleFileSelect = (file: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Formato inválido', {
        description: 'Por favor sube un archivo CSV o Excel (.xlsx)',
      });
      return;
    }

    setFile(file);
    setData([]);
    setErrors([]);
    setImportResults(null);
    parseFile(file);
  };

  const parseFile = async (file: File) => {
    setIsProcessing(true);

    try {
      if (file.name.endsWith('.csv')) {
        // Parse CSV
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            processData(results.data as any[]);
          },
          error: (error) => {
            toast.error('Error al leer CSV', { description: error.message });
            setIsProcessing(false);
          },
        });
      } else {
        // Parse Excel
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            processData(jsonData as any[]);
          } catch (error) {
            toast.error('Error al leer Excel', {
              description: error instanceof Error ? error.message : 'Error desconocido',
            });
            setIsProcessing(false);
          }
        };
        reader.readAsBinaryString(file);
      }
    } catch (error) {
      toast.error('Error al procesar archivo');
      setIsProcessing(false);
    }
  };

  const processData = (rawData: any[]) => {
    const validationErrors: ValidationError[] = [];
    const processedData: ResidentRow[] = [];

    // Helper function to convert values to strings safely
    const toString = (value: any): string => {
      if (value === null || value === undefined) return '';
      return String(value).trim();
    };

    rawData.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because of header row and 1-based indexing

      // Normalize keys (handle different column names) and convert values to strings
      const normalizedRow: any = {};
      Object.keys(row).forEach((key) => {
        const normalized = key.toLowerCase().trim().replace(/\s+/g, '_');
        normalizedRow[normalized] = toString(row[key]);
      });

      // Map to expected fields with flexible column matching
      const resident: ResidentRow = {
        // Unit number: apt, apartamento, apto, unit, unidad, número, no, #, etc.
        unit_number: normalizedRow.unit_number || normalizedRow.apt || normalizedRow['#apt'] ||
                     normalizedRow.unit || normalizedRow.apartamento || normalizedRow.apto ||
                     normalizedRow.apt_number || normalizedRow.número || normalizedRow.numero ||
                     normalizedRow.no || normalizedRow['#'] || normalizedRow.apt_num || '',

        // First name: nombre, primer_nombre, name
        first_name: normalizedRow.first_name || normalizedRow.nombre ||
                    normalizedRow.primer_nombre || normalizedRow.name || '',

        // Last name: apellido, apellidos, last_name, surname
        last_name: normalizedRow.last_name || normalizedRow.apellido ||
                   normalizedRow.apellidos || normalizedRow.surname || '',

        // Email: email, correo, correo_electrónico, e-mail
        email: normalizedRow.email || normalizedRow.correo ||
               normalizedRow.correo_electrónico || normalizedRow.correo_electronico ||
               normalizedRow['e-mail'] || '',

        // Phone: phone, teléfono, telefono, celular, móvil, movil, cell, tel
        phone: normalizedRow.phone || normalizedRow.telefono || normalizedRow.teléfono ||
               normalizedRow.tel || normalizedRow.celular || normalizedRow.móvil ||
               normalizedRow.movil || normalizedRow.cell || normalizedRow.mobile || '',

        // WhatsApp: whatsapp, whatsapp_number, wa
        whatsapp_number: normalizedRow.whatsapp_number || normalizedRow.whatsapp ||
                         normalizedRow.wa || normalizedRow.phone || normalizedRow.telefono || '',

        // Type: tipo, type, propietario/inquilino, dueño/renter, owner/renter
        type: (() => {
          const typeValue = (normalizedRow.type || normalizedRow.tipo || '').toLowerCase();
          if (!typeValue) return '' as any; // Will be caught by validation
          return typeValue === 'renter' || typeValue === 'inquilino' ||
                 typeValue === 'tenant' || typeValue === 'arrendatario' ? 'renter' : 'owner';
        })(),

        opted_in_whatsapp: normalizedRow.opted_in_whatsapp !== 'false' && normalizedRow.opted_in_whatsapp !== false,
        opted_in_email: normalizedRow.opted_in_email !== 'false' && normalizedRow.opted_in_email !== false,
        opted_in_sms: normalizedRow.opted_in_sms !== 'false' && normalizedRow.opted_in_sms !== false,
      };

      // Validate critical required fields (these block import)
      if (!resident.unit_number || resident.unit_number.trim() === '') {
        validationErrors.push({ row: rowNumber, field: 'unit_number', message: 'Número de unidad requerido', severity: 'error' });
      }
      if (!resident.first_name || resident.first_name.trim() === '') {
        validationErrors.push({ row: rowNumber, field: 'first_name', message: 'Nombre requerido', severity: 'error' });
      }
      if (!resident.last_name || resident.last_name.trim() === '') {
        validationErrors.push({ row: rowNumber, field: 'last_name', message: 'Apellido requerido', severity: 'error' });
      }

      // Validate optional fields (these show warnings but don't block import)
      if (!resident.email || resident.email.trim() === '') {
        validationErrors.push({ row: rowNumber, field: 'email', message: 'Sin email - no podrá recibir comunicaciones por correo', severity: 'warning' });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resident.email.trim())) {
        validationErrors.push({ row: rowNumber, field: 'email', message: 'Email inválido', severity: 'error' });
      }

      if (!resident.phone || resident.phone.trim() === '') {
        validationErrors.push({ row: rowNumber, field: 'phone', message: 'Sin teléfono - no podrá recibir WhatsApp', severity: 'warning' });
      } else {
        // Clean phone number and validate
        const cleanedPhone = resident.phone.replace(/[\s-()]/g, '');
        if (!/^\+?[0-9]{10,15}$/.test(cleanedPhone)) {
          validationErrors.push({ row: rowNumber, field: 'phone', message: 'Teléfono inválido', severity: 'error' });
        }
      }

      if (!resident.type) {
        validationErrors.push({ row: rowNumber, field: 'type', message: 'Sin tipo - se asignará como dueño por defecto', severity: 'warning' });
      }

      processedData.push(resident);
    });

    setData(processedData);
    setErrors(validationErrors);
    setIsProcessing(false);

    const errors = validationErrors.filter(e => e.severity === 'error');
    const warnings = validationErrors.filter(e => e.severity === 'warning');

    if (errors.length > 0) {
      toast.error(`${errors.length} errores encontrados`, {
        description: 'Corrige los errores antes de importar',
      });
    } else if (warnings.length > 0) {
      toast.warning(`${warnings.length} advertencias`, {
        description: 'Puedes importar y completar la información después',
      });
    } else {
      toast.success(`${processedData.length} residentes listos para importar`);
    }
  };

  const handleImport = async () => {
    const criticalErrors = errors.filter(e => e.severity === 'error');

    if (criticalErrors.length > 0) {
      toast.error('Hay errores críticos en los datos', {
        description: 'Por favor corrige los errores antes de importar',
      });
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch('/api/residents/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId,
          residents: data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import residents');
      }

      setImportResults({ success: result.success, failed: result.failed });

      toast.success('Importación completa', {
        description: `${result.success} residentes importados exitosamente${result.failed > 0 ? `, ${result.failed} fallidos` : ''}`,
        duration: 5000,
      });

      // Reset after a delay
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 2000);

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Error al importar', {
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setData([]);
    setErrors([]);
    setImportResults(null);
    onClose();
  };

  const downloadTemplate = () => {
    const template = [
      {
        unit_number: '101',
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '+17875551234',
        whatsapp_number: '+17875551234',
        type: 'owner',
        opted_in_whatsapp: 'true',
        opted_in_email: 'true',
        opted_in_sms: 'false',
      },
      {
        unit_number: '102',
        first_name: 'María',
        last_name: 'González',
        email: 'maria.gonzalez@example.com',
        phone: '+17875555678',
        whatsapp_number: '+17875555678',
        type: 'renter',
        opted_in_whatsapp: 'true',
        opted_in_email: 'true',
        opted_in_sms: 'false',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Residentes');
    XLSX.writeFile(workbook, 'plantilla_residentes.xlsx');

    toast.success('Plantilla descargada', {
      description: 'Abre el archivo y agrega tus residentes',
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Residentes en Masa</DialogTitle>
          <DialogDescription>
            Sube un archivo Excel o CSV con la información de múltiples residentes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">¿Primera vez?</p>
                <p className="text-xs text-muted-foreground">Descarga la plantilla para empezar</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Descargar Plantilla
            </Button>
          </div>

          {/* Help Section */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium">¿Tu Excel tiene columnas diferentes?</p>
              </div>
              {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showHelp && (
              <div className="p-4 space-y-3 text-sm border-t border-border">
                <p className="text-muted-foreground">
                  <strong>No necesitas cambiar nada.</strong> El sistema reconoce automáticamente estos nombres de columnas:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="font-medium text-xs mb-1">📍 Unidad/Apartamento</p>
                    <p className="text-xs text-muted-foreground">apt, apartamento, unit, número, #apt, apto</p>
                  </div>

                  <div className="p-2 bg-muted/30 rounded">
                    <p className="font-medium text-xs mb-1">👤 Nombre</p>
                    <p className="text-xs text-muted-foreground">first_name, nombre, name</p>
                  </div>

                  <div className="p-2 bg-muted/30 rounded">
                    <p className="font-medium text-xs mb-1">👤 Apellido</p>
                    <p className="text-xs text-muted-foreground">last_name, apellido, surname</p>
                  </div>

                  <div className="p-2 bg-muted/30 rounded">
                    <p className="font-medium text-xs mb-1">📧 Email (recomendado)</p>
                    <p className="text-xs text-muted-foreground">email, correo, e-mail</p>
                  </div>

                  <div className="p-2 bg-muted/30 rounded">
                    <p className="font-medium text-xs mb-1">📱 Teléfono (recomendado)</p>
                    <p className="text-xs text-muted-foreground">phone, telefono, celular, móvil, tel</p>
                  </div>

                  <div className="p-2 bg-muted/30 rounded">
                    <p className="font-medium text-xs mb-1">🏠 Tipo (recomendado)</p>
                    <p className="text-xs text-muted-foreground">dueño/owner, inquilino/renter</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Requerido:</strong> Unidad, Nombre, Apellido. <strong>Recomendado:</strong> Email, Teléfono, Tipo.
                    Puedes importar con datos incompletos y agregar el resto después manualmente.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile) handleFileSelect(droppedFile);
            }}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {file ? file.name : 'Arrastra tu archivo aquí o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Soporta archivos CSV y Excel (.xlsx)
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) handleFileSelect(selectedFile);
              }}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" size="sm" asChild>
                <span>Seleccionar Archivo</span>
              </Button>
            </label>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-3 p-6">
              <Spinner />
              <p className="text-sm text-muted-foreground">Procesando archivo...</p>
            </div>
          )}

          {/* Data Preview */}
          {!isProcessing && data.length > 0 && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold">{data.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {data.length - new Set(errors.map(e => e.row)).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Completos</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {errors.filter(e => e.severity === 'error').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Errores</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {errors.filter(e => e.severity === 'warning').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Advertencias</p>
                </div>
              </div>

              {/* Errors */}
              {errors.filter(e => e.severity === 'error').length > 0 && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {errors.filter(e => e.severity === 'error').length} errores críticos - deben corregirse
                      </p>
                      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {errors.filter(e => e.severity === 'error').slice(0, 10).map((error, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            Fila {error.row}: {error.field} - {error.message}
                          </p>
                        ))}
                        {errors.filter(e => e.severity === 'error').length > 10 && (
                          <p className="text-xs text-muted-foreground font-medium">
                            ... y {errors.filter(e => e.severity === 'error').length - 10} errores más
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {errors.filter(e => e.severity === 'warning').length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
                        {errors.filter(e => e.severity === 'warning').length} advertencias - puedes importar y completar después
                      </p>
                      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {errors.filter(e => e.severity === 'warning').slice(0, 10).map((error, i) => (
                          <p key={i} className="text-xs text-yellow-700 dark:text-yellow-300">
                            Fila {error.row}: {error.message}
                          </p>
                        ))}
                        {errors.filter(e => e.severity === 'warning').length > 10 && (
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                            ... y {errors.filter(e => e.severity === 'warning').length - 10} advertencias más
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="p-2 text-left font-medium">Apt</th>
                        <th className="p-2 text-left font-medium">Nombre</th>
                        <th className="p-2 text-left font-medium">Email</th>
                        <th className="p-2 text-left font-medium">Teléfono</th>
                        <th className="p-2 text-left font-medium">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 50).map((resident, i) => {
                        const rowErrors = errors.filter((e) => e.row === i + 2 && e.severity === 'error');
                        const rowWarnings = errors.filter((e) => e.row === i + 2 && e.severity === 'warning');
                        const hasErrors = rowErrors.length > 0;
                        const hasWarnings = rowWarnings.length > 0 && !hasErrors;

                        return (
                          <tr
                            key={i}
                            className={`border-t ${
                              hasErrors ? 'bg-destructive/5' : hasWarnings ? 'bg-yellow-50 dark:bg-yellow-950/10' : ''
                            }`}
                          >
                            <td className="p-2">{resident.unit_number || '-'}</td>
                            <td className="p-2">{`${resident.first_name || '-'} ${resident.last_name || '-'}`}</td>
                            <td className="p-2 text-xs">
                              {resident.email || <span className="text-yellow-600 dark:text-yellow-400">Sin email</span>}
                            </td>
                            <td className="p-2 text-xs">
                              {resident.phone || <span className="text-yellow-600 dark:text-yellow-400">Sin teléfono</span>}
                            </td>
                            <td className="p-2">
                              {resident.type ? (
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  resident.type === 'owner'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                                }`}>
                                  {resident.type === 'owner' ? 'Dueño' : 'Inquilino'}
                                </span>
                              ) : (
                                <span className="text-xs text-yellow-600 dark:text-yellow-400">Por defecto: Dueño</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {data.length > 50 && (
                    <div className="p-2 text-center bg-muted/30 text-xs text-muted-foreground">
                      Mostrando 50 de {data.length} residentes
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Import Results */}
          {importResults && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-sm">Importación completada</p>
                  <p className="text-xs text-muted-foreground">
                    {importResults.success} residentes importados{importResults.failed > 0 ? `, ${importResults.failed} fallidos` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isImporting}>
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={data.length === 0 || errors.length > 0 || isImporting}
              className="gap-2"
            >
              {isImporting ? (
                <>
                  <Spinner size="sm" className="border-white border-t-transparent" />
                  <span>Importando...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Importar {data.length} Residentes</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
