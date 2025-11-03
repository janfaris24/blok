import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * List all asambleas for the authenticated admin's building
 * GET /api/asambleas/list
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get building
    const { data: building } = await supabase
      .from('buildings')
      .select('id')
      .eq('admin_user_id', user.id)
      .single();

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    // Get all asambleas, ordered by meeting date (newest first)
    const { data: asambleas, error } = await supabase
      .from('asambleas')
      .select('*')
      .eq('building_id', building.id)
      .order('meeting_date', { ascending: false });

    if (error) {
      console.error('Error fetching asambleas:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ asambleas: asambleas || [] });
  } catch (error: any) {
    console.error('Error in asambleas list:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
