import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { month, dueDate, defaultAmount } = body;

    // Validate required fields
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

    // Get all units for the building
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select('id, unit_number, owner_id')
      .eq('building_id', building.id)
      .not('owner_id', 'is', null); // Only units with owners

    if (unitsError) {
      console.error('Error fetching units:', unitsError);
      return NextResponse.json({ error: unitsError.message }, { status: 500 });
    }

    if (!units || units.length === 0) {
      return NextResponse.json({ error: 'No units found in building' }, { status: 404 });
    }

    // Check if fees already exist for this month
    const { data: existingFees } = await supabase
      .from('maintenance_fees')
      .select('id')
      .eq('building_id', building.id)
      .eq('due_date', dueDate)
      .limit(1);

    if (existingFees && existingFees.length > 0) {
      return NextResponse.json({ error: 'Fees already generated for this month' }, { status: 400 });
    }

    // Generate fee records for all units
    const feeRecords = units.map(unit => ({
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
      .insert(feeRecords)
      .select();

    if (createError) {
      console.error('Error creating maintenance fees:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${createdFees.length} fee records`,
      count: createdFees.length,
      fees: createdFees
    });

  } catch (error) {
    console.error('Error generating maintenance fees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
