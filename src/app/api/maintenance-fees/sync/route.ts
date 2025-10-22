import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

/**
 * Sync maintenance fees - creates missing fee records for units that have owners
 * but no fee record for the specified month
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { month, dueDate, defaultAmount } = body;

    if (!month || !dueDate || !defaultAmount) {
      return NextResponse.json({ error: 'Month, due date, and default amount required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get user's building
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: building } = await supabase
      .from('buildings')
      .select('id')
      .eq('admin_user_id', user.id)
      .single();

    if (!building) {
      return NextResponse.json({ error: 'No building found for user' }, { status: 403 });
    }

    // Get all units with owners
    const { data: allUnits, error: unitsError } = await supabase
      .from('units')
      .select('id, unit_number, owner_id')
      .eq('building_id', building.id)
      .not('owner_id', 'is', null);

    if (unitsError) {
      console.error('Error fetching units:', unitsError);
      return NextResponse.json({ error: unitsError.message }, { status: 500 });
    }

    if (!allUnits || allUnits.length === 0) {
      return NextResponse.json({ error: 'No units with owners found' }, { status: 404 });
    }

    // Get existing fees for this month
    const { data: existingFees } = await supabase
      .from('maintenance_fees')
      .select('unit_id')
      .eq('building_id', building.id)
      .eq('due_date', dueDate);

    const existingUnitIds = new Set(existingFees?.map(f => f.unit_id) || []);

    // Find units that need fee records
    const missingUnits = allUnits.filter(unit => !existingUnitIds.has(unit.id));

    if (missingUnits.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All units already have fees',
        added: 0,
      });
    }

    // Create missing fee records
    const newFeeRecords = missingUnits.map(unit => ({
      unit_id: unit.id,
      building_id: building.id,
      amount: parseFloat(defaultAmount),
      due_date: dueDate,
      status: 'pending',
      late_fee: 0,
      reminder_count: 0,
    }));

    const { data: createdFees, error: createError } = await supabase
      .from('maintenance_fees')
      .insert(newFeeRecords)
      .select();

    if (createError) {
      console.error('Error creating maintenance fees:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Added ${createdFees.length} missing fee record(s)`,
      added: createdFees.length,
      units: missingUnits.map(u => u.unit_number),
    });

  } catch (error) {
    console.error('Error syncing maintenance fees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
