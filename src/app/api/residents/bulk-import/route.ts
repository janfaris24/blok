import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

interface ResidentData {
  unit_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  whatsapp_number?: string;
  type: 'owner' | 'renter';
  opted_in_whatsapp?: boolean;
  opted_in_email?: boolean;
  opted_in_sms?: boolean;
}

/**
 * Bulk import residents
 *
 * POST /api/residents/bulk-import
 * Body: {
 *   buildingId: string;
 *   residents: ResidentData[];
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { buildingId, residents } = await request.json();

    if (!buildingId || !residents || !Array.isArray(residents)) {
      return NextResponse.json(
        { error: 'Missing buildingId or residents array' },
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

    console.log(`[Bulk Import] Starting import of ${residents.length} residents for building ${buildingId}`);

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Get all existing units for this building
    const { data: existingUnits } = await supabase
      .from('units')
      .select('id, unit_number')
      .eq('building_id', buildingId);

    const unitMap = new Map<string, string>();
    existingUnits?.forEach((unit) => {
      unitMap.set(unit.unit_number.toLowerCase(), unit.id);
    });

    // Process each resident
    for (const [index, resident] of residents.entries()) {
      try {
        // Validate required fields
        if (!resident.unit_number || !resident.first_name || !resident.last_name) {
          failCount++;
          errors.push(`Row ${index + 1}: Missing required fields`);
          continue;
        }

        // Find or create unit
        let unitId = unitMap.get(resident.unit_number.toLowerCase());

        if (!unitId) {
          // Create new unit
          const { data: newUnit, error: unitError } = await supabase
            .from('units')
            .insert({
              building_id: buildingId,
              unit_number: resident.unit_number,
            })
            .select('id')
            .single();

          if (unitError || !newUnit) {
            failCount++;
            errors.push(`Row ${index + 1}: Failed to create unit ${resident.unit_number}`);
            console.error(`[Bulk Import] Failed to create unit:`, unitError);
            continue;
          }

          unitId = newUnit.id;
          unitMap.set(resident.unit_number.toLowerCase(), newUnit.id);
          console.log(`[Bulk Import] Created new unit ${resident.unit_number}: ${newUnit.id}`);
        }

        // Format phone numbers
        const formatPhone = (phone: string) => {
          if (!phone) return '';
          // Remove all non-numeric characters
          const cleaned = phone.replace(/\D/g, '');
          // If it starts with 1787 or 1939, add + prefix
          if (cleaned.startsWith('1787') || cleaned.startsWith('1939')) {
            return `+${cleaned}`;
          }
          // If it starts with 787 or 939, add +1 prefix
          if (cleaned.startsWith('787') || cleaned.startsWith('939')) {
            return `+1${cleaned}`;
          }
          // Otherwise return as-is with + prefix if missing
          return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
        };

        // Create resident
        const { error: residentError } = await supabase
          .from('residents')
          .insert({
            building_id: buildingId,
            unit_id: unitId,
            type: resident.type || 'owner', // Default to owner if not specified
            first_name: resident.first_name.trim(),
            last_name: resident.last_name.trim(),
            email: resident.email?.trim() || null,
            phone: resident.phone ? formatPhone(resident.phone) : null,
            whatsapp_number: resident.whatsapp_number
              ? formatPhone(resident.whatsapp_number)
              : resident.phone
              ? formatPhone(resident.phone)
              : null,
            opted_in_whatsapp: resident.opted_in_whatsapp ?? true,
            opted_in_email: resident.opted_in_email ?? true,
            opted_in_sms: resident.opted_in_sms ?? false,
            preferred_language: 'es',
          });

        if (residentError) {
          failCount++;
          errors.push(`Row ${index + 1}: ${residentError.message}`);
          console.error(`[Bulk Import] Failed to create resident:`, residentError);
          continue;
        }

        // Update unit ownership or renter status
        const { data: existingResident } = await supabase
          .from('residents')
          .select('id')
          .eq('building_id', buildingId)
          .eq('unit_id', unitId)
          .eq('first_name', resident.first_name.trim())
          .eq('last_name', resident.last_name.trim())
          .single();

        if (existingResident) {
          if (resident.type === 'owner') {
            await supabase
              .from('units')
              .update({ owner_id: existingResident.id })
              .eq('id', unitId);
          } else if (resident.type === 'renter') {
            await supabase
              .from('units')
              .update({ current_renter_id: existingResident.id })
              .eq('id', unitId);
          }
        }

        successCount++;
        console.log(`[Bulk Import] ✅ Created resident: ${resident.first_name} ${resident.last_name} (Unit ${resident.unit_number})`);

      } catch (error) {
        failCount++;
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`[Bulk Import] Error processing row ${index + 1}:`, error);
      }

      // Rate limiting: Add small delay between inserts
      if ((index + 1) % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(`[Bulk Import] Complete: ${successCount} success, ${failCount} failed`);

    return NextResponse.json({
      success: successCount,
      failed: failCount,
      errors: errors.length > 0 ? errors.slice(0, 20) : undefined, // Return first 20 errors
    });

  } catch (error) {
    console.error('[Bulk Import] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
