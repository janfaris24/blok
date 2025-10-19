import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Bulk edit residents
 *
 * POST /api/residents/bulk-edit
 * Body: {
 *   buildingId: string;
 *   residentIds: string[];
 *   updates: {
 *     type?: 'owner' | 'renter';
 *     unit_id?: string | null;
 *     preferred_language?: 'es' | 'en';
 *     opted_in_whatsapp?: boolean;
 *   };
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { buildingId, residentIds, updates } = await request.json();

    if (!buildingId || !residentIds || !Array.isArray(residentIds) || residentIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing buildingId or residentIds array' },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify building ownership
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id')
      .eq('id', buildingId)
      .eq('admin_user_id', user.id)
      .single();

    if (buildingError || !building) {
      return NextResponse.json({ error: 'Unauthorized or building not found' }, { status: 403 });
    }

    console.log(`[Bulk Edit] Starting bulk edit of ${residentIds.length} residents for building ${buildingId}`);
    console.log(`[Bulk Edit] Updates:`, updates);

    // Get all residents to update
    const { data: residents, error: fetchError } = await supabase
      .from('residents')
      .select('id, type, unit_id')
      .eq('building_id', buildingId)
      .in('id', residentIds);

    if (fetchError) {
      console.error(`[Bulk Edit] Error fetching residents:`, fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch residents', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!residents || residents.length === 0) {
      return NextResponse.json(
        { error: 'No residents found' },
        { status: 404 }
      );
    }

    // Update all residents
    const { error: updateError } = await supabase
      .from('residents')
      .update(updates)
      .eq('building_id', buildingId)
      .in('id', residentIds);

    if (updateError) {
      console.error(`[Bulk Edit] Error updating residents:`, updateError);
      return NextResponse.json(
        { error: 'Failed to update residents', details: updateError.message },
        { status: 500 }
      );
    }

    // If type or unit_id changed, we need to update the units table
    if (updates.type !== undefined || updates.unit_id !== undefined) {
      console.log(`[Bulk Edit] Updating unit associations...`);

      for (const resident of residents) {
        // Clear old unit associations for this resident
        if (resident.unit_id) {
          await supabase
            .from('units')
            .update({ owner_id: null })
            .eq('owner_id', resident.id);

          await supabase
            .from('units')
            .update({ current_renter_id: null })
            .eq('current_renter_id', resident.id);
        }

        // Set new unit association
        const newUnitId = updates.unit_id !== undefined ? updates.unit_id : resident.unit_id;
        const newType = updates.type !== undefined ? updates.type : resident.type;

        if (newUnitId) {
          if (newType === 'owner') {
            await supabase
              .from('units')
              .update({ owner_id: resident.id })
              .eq('id', newUnitId);
          } else if (newType === 'renter') {
            await supabase
              .from('units')
              .update({ current_renter_id: resident.id })
              .eq('id', newUnitId);
          }
        }
      }
    }

    console.log(`[Bulk Edit] Successfully updated ${residents.length} residents`);

    return NextResponse.json({
      success: true,
      updated: residents.length,
    });

  } catch (error) {
    console.error('[Bulk Edit] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
