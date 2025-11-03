import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Update an existing asamblea
 * PUT /api/asambleas/update
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, meeting_date, meeting_type, location, agenda, meeting_link, notes, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Asamblea ID is required' }, { status: 400 });
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

    // Build update object
    const updateData: any = {};
    if (meeting_date !== undefined) updateData.meeting_date = meeting_date;
    if (meeting_type !== undefined) updateData.meeting_type = meeting_type;
    if (location !== undefined) updateData.location = location;
    if (agenda !== undefined) updateData.agenda = agenda;
    if (meeting_link !== undefined) updateData.meeting_link = meeting_link;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    // Update asamblea
    const { data: asamblea, error } = await supabase
      .from('asambleas')
      .update(updateData)
      .eq('id', id)
      .eq('building_id', building.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating asamblea:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ asamblea });
  } catch (error: any) {
    console.error('Error in asamblea update:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
