import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Import residents from CSV
 *
 * POST /api/residents/import
 * Content-Type: multipart/form-data
 * Body: FormData with 'file' field containing CSV
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get admin's building
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id, name')
      .eq('admin_user_id', user.id)
      .single();

    if (buildingError || !building) {
      return NextResponse.json(
        { error: 'No se encontró el edificio' },
        { status: 404 }
      );
    }

    // Read CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'El archivo CSV está vacío' },
        { status: 400 }
      );
    }

    // Parse CSV (skip header)
    const residents = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.trim());

      // Expected format: tipo,nombre,apellido,email,telefono,numero_unidad
      if (parts.length < 6) {
        errors.push(`Línea ${i + 1}: Formato incorrecto (faltan campos)`);
        continue;
      }

      const [tipo, nombre, apellido, email, telefono, numeroUnidad] = parts;

      // Validate type
      if (tipo !== 'owner' && tipo !== 'renter') {
        errors.push(`Línea ${i + 1}: Tipo debe ser 'owner' o 'renter'`);
        continue;
      }

      // Find unit by number
      const { data: unit } = await supabase
        .from('units')
        .select('id')
        .eq('building_id', building.id)
        .eq('unit_number', numeroUnidad)
        .single();

      if (!unit) {
        errors.push(`Línea ${i + 1}: No se encontró la unidad ${numeroUnidad}`);
        continue;
      }

      residents.push({
        building_id: building.id,
        unit_id: unit.id,
        type: tipo,
        first_name: nombre,
        last_name: apellido,
        email: email || null,
        phone: telefono,
        whatsapp_number: telefono, // Assume phone = WhatsApp
        preferred_language: 'es',
        opted_in_whatsapp: false, // Must opt-in manually
        opted_in_email: false,
        opted_in_sms: false,
      });
    }

    // Insert residents
    let inserted = 0;
    if (residents.length > 0) {
      const { data, error: insertError } = await supabase
        .from('residents')
        .insert(residents)
        .select();

      if (insertError) {
        console.error('[CSV Import] Insert error:', insertError);
        return NextResponse.json(
          { error: 'Error al importar residentes', details: insertError.message },
          { status: 500 }
        );
      }

      inserted = data?.length || 0;
    }

    console.log('[CSV Import] ✅ Success:', {
      building: building.name,
      imported: inserted,
      errors: errors.length,
    });

    return NextResponse.json({
      success: true,
      imported: inserted,
      errors: errors.length > 0 ? errors : undefined,
      message: `Se importaron ${inserted} residentes`,
    });

  } catch (error) {
    console.error('[CSV Import] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
