import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Create a new asamblea
 * POST /api/asambleas/create
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { meeting_date, meeting_type, location, agenda, meeting_link, notes, status } = body;

    // Validation
    if (!meeting_date || !meeting_type || !location) {
      return NextResponse.json(
        { error: 'meeting_date, meeting_type, and location are required' },
        { status: 400 }
      );
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

    // Create asamblea
    const { data: asamblea, error } = await supabase
      .from('asambleas')
      .insert({
        building_id: building.id,
        meeting_date,
        meeting_type,
        location,
        agenda: agenda || [],
        meeting_link,
        notes,
        status: status || 'scheduled',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating asamblea:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ asamblea }, { status: 201 });
  } catch (error: any) {
    console.error('Error in asamblea create:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
