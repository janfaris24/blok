import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

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
    let duplicateCount = 0;
    let unitsCreated = 0;
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

    // Get all existing residents for this building to check for duplicates
    const { data: existingResidents } = await supabase
      .from('residents')
      .select('first_name, last_name, unit_id, units!inner(unit_number)')
      .eq('building_id', buildingId);

    // Create a Set of existing residents for duplicate checking
    // Key format: "firstname|lastname|unitnumber"
    const existingResidentsSet = new Set<string>();
    existingResidents?.forEach((resident: any) => {
      const key = `${resident.first_name.toLowerCase().trim()}|${resident.last_name.toLowerCase().trim()}|${resident.units?.unit_number?.toLowerCase().trim() || ''}`;
      existingResidentsSet.add(key);
    });
    console.log(`[Bulk Import] Found ${existingResidentsSet.size} existing residents in database`);

    // Step 1: Identify and create all new units in batch
    console.log(`[Bulk Import] Checking for new units to create...`);
    const uniqueUnitNumbers = new Map<string, number | undefined>(); // unit_number -> floor
    residents.forEach((resident) => {
      if (resident.unit_number) {
        const unitKey = resident.unit_number.toLowerCase();
        // Store floor if not already stored (use first occurrence)
        if (!uniqueUnitNumbers.has(unitKey)) {
          uniqueUnitNumbers.set(unitKey, resident.floor);
        }
      }
    });

    const newUnitsToCreate: Array<{ unitNumber: string; floor?: number }> = [];
    uniqueUnitNumbers.forEach((floor, unitNumber) => {
      if (!unitMap.has(unitNumber)) {
        newUnitsToCreate.push({ unitNumber, floor });
      }
    });

    if (newUnitsToCreate.length > 0) {
      console.log(`[Bulk Import] Creating ${newUnitsToCreate.length} new units...`);

      const unitsData = newUnitsToCreate.map(({ unitNumber, floor }) => ({
        building_id: buildingId,
        unit_number: unitNumber,
        floor: floor ?? null, // Include floor if provided, otherwise null
      }));

      const { data: createdUnits, error: unitsError } = await supabase
        .from('units')
        .insert(unitsData)
        .select('id, unit_number');

      if (unitsError) {
        console.error(`[Bulk Import] Error creating units:`, unitsError);
        return NextResponse.json(
          { error: 'Failed to create units', details: unitsError.message },
          { status: 500 }
        );
      }

      if (createdUnits) {
        createdUnits.forEach((unit) => {
          unitMap.set(unit.unit_number.toLowerCase(), unit.id);
          unitsCreated++;
        });
        console.log(`[Bulk Import] ✅ Created ${unitsCreated} new units`);
      }
    } else {
      console.log(`[Bulk Import] All units already exist, no new units to create`);
    }

    // Track duplicates within this import batch
    const importBatchSet = new Set<string>();

    // Step 2: Process each resident
    for (const [index, resident] of residents.entries()) {
      try {
        // Validate required fields
        if (!resident.unit_number || !resident.first_name || !resident.last_name) {
          failCount++;
          errors.push(`Row ${index + 1}: Missing required fields`);
          continue;
        }

        // Get unit ID (should exist now after batch creation)
        const unitId = unitMap.get(resident.unit_number.toLowerCase());

        if (!unitId) {
          failCount++;
          errors.push(`Row ${index + 1}: Unit ${resident.unit_number} not found`);
          continue;
        }

        // Check for duplicates
        const residentKey = `${resident.first_name.toLowerCase().trim()}|${resident.last_name.toLowerCase().trim()}|${resident.unit_number.toLowerCase().trim()}`;

        // Check if already exists in database
        if (existingResidentsSet.has(residentKey)) {
          duplicateCount++;
          console.log(`[Bulk Import] ⚠️  Skipping duplicate (exists in DB): ${resident.first_name} ${resident.last_name} (Unit ${resident.unit_number})`);
          continue;
        }

        // Check if duplicate within this import batch
        if (importBatchSet.has(residentKey)) {
          duplicateCount++;
          console.log(`[Bulk Import] ⚠️  Skipping duplicate (appears multiple times in file): ${resident.first_name} ${resident.last_name} (Unit ${resident.unit_number})`);
          continue;
        }

        // Mark as processed in this batch
        importBatchSet.add(residentKey);

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

    console.log(`[Bulk Import] Complete: ${unitsCreated} units created, ${successCount} residents imported, ${duplicateCount} duplicates skipped, ${failCount} failed`);

    return NextResponse.json({
      success: successCount,
      failed: failCount,
      duplicates: duplicateCount,
      unitsCreated: unitsCreated,
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
