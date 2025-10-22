import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get filters from query params
    const status = searchParams.get('status');
    const unitId = searchParams.get('unitId');
    const month = searchParams.get('month'); // Format: YYYY-MM
    const limit = parseInt(searchParams.get('limit') || '50');

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

    // Build query
    let query = supabase
      .from('maintenance_fees')
      .select(`
        *,
        unit:units (
          id,
          unit_number,
          floor,
          owner:residents!units_owner_id_fkey (
            id,
            first_name,
            last_name,
            phone,
            whatsapp_number,
            email
          ),
          renter:residents!units_current_renter_id_fkey (
            id,
            first_name,
            last_name,
            phone,
            whatsapp_number,
            email
          )
        )
      `)
      .eq('building_id', building.id)
      .order('due_date', { ascending: false })
      .limit(limit);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (unitId) {
      query = query.eq('unit_id', unitId);
    }

    if (month) {
      // Filter by month (e.g., '2025-01')
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      query = query.gte('due_date', startDate).lte('due_date', endDate);
    }

    const { data: fees, error } = await query;

    if (error) {
      console.error('Error fetching maintenance fees:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate totals
    const totals = {
      total: fees?.reduce((sum, fee) => sum + parseFloat(fee.total_amount || 0), 0) || 0,
      pending: fees?.filter(f => f.status === 'pending' || f.status === 'pending_pickup').reduce((sum, fee) => sum + parseFloat(fee.total_amount || 0), 0) || 0,
      late: fees?.filter(f => f.status === 'late').reduce((sum, fee) => sum + parseFloat(fee.total_amount || 0), 0) || 0,
      paid: fees?.filter(f => f.status === 'paid').reduce((sum, fee) => sum + parseFloat(fee.total_amount || 0), 0) || 0,
      count: {
        total: fees?.length || 0,
        pending: fees?.filter(f => f.status === 'pending' || f.status === 'pending_pickup').length || 0,
        late: fees?.filter(f => f.status === 'late').length || 0,
        paid: fees?.filter(f => f.status === 'paid').length || 0,
      }
    };

    return NextResponse.json({ fees, totals });

  } catch (error) {
    console.error('Error in maintenance fees list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
