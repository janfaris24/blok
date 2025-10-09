import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Complete onboarding for a building
 *
 * POST /api/onboarding/complete
 * Body: {
 *   address: string;
 *   totalUnits: number;
 *   whatsappBusinessNumber?: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { address, totalUnits, whatsappBusinessNumber } = await request.json();

    // Validate required fields
    if (!address || !totalUnits) {
      return NextResponse.json(
        { error: 'Falta dirección o número de unidades' },
        { status: 400 }
      );
    }

    // Validate totalUnits is a reasonable number
    if (totalUnits < 1 || totalUnits > 500) {
      return NextResponse.json(
        { error: 'El número de unidades debe estar entre 1 y 500' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get the building for this admin
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('*')
      .eq('admin_user_id', user.id)
      .single();

    if (buildingError || !building) {
      return NextResponse.json(
        { error: 'No se encontró el edificio' },
        { status: 404 }
      );
    }

    // Check if already completed
    if (building.onboarding_completed) {
      return NextResponse.json(
        { error: 'La configuración inicial ya fue completada' },
        { status: 400 }
      );
    }

    // Update building with complete info
    const { error: updateError } = await supabase
      .from('buildings')
      .update({
        address,
        total_units: totalUnits,
        whatsapp_business_number: whatsappBusinessNumber || null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', building.id);

    if (updateError) {
      console.error('[Onboarding] Failed to update building:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar el edificio' },
        { status: 500 }
      );
    }

    // Generate initial units
    // Format: 101, 102, 103... or 201, 202, 203... etc.
    const unitsToCreate = [];
    const unitsPerFloor = 10; // Assume max 10 units per floor

    for (let i = 1; i <= totalUnits; i++) {
      const floor = Math.ceil(i / unitsPerFloor);
      const unitOnFloor = ((i - 1) % unitsPerFloor) + 1;
      const unitNumber = `${floor}${unitOnFloor.toString().padStart(2, '0')}`;

      unitsToCreate.push({
        building_id: building.id,
        unit_number: unitNumber,
        floor,
        is_rented: false,
      });
    }

    // Insert units in batches (Supabase has limits)
    const batchSize = 100;
    for (let i = 0; i < unitsToCreate.length; i += batchSize) {
      const batch = unitsToCreate.slice(i, i + batchSize);
      const { error: unitsError } = await supabase
        .from('units')
        .insert(batch);

      if (unitsError) {
        console.error('[Onboarding] Failed to create units:', unitsError);
        // Continue anyway - units can be added manually later
      }
    }

    console.log('[Onboarding] ✅ Completed for building:', building.name, {
      totalUnits,
      unitsCreated: unitsToCreate.length,
    });

    return NextResponse.json({
      success: true,
      building: {
        id: building.id,
        name: building.name,
        totalUnits,
      },
    });

  } catch (error) {
    console.error('[Onboarding] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
