import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { buildingId, name, role, phone, email } = body;

    if (!buildingId || !name || !role) {
      return NextResponse.json(
        { error: 'Building ID, name, and role are required' },
        { status: 400 }
      );
    }

    // Verify user has access to this building
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: building } = await supabase
      .from('buildings')
      .select('id')
      .eq('id', buildingId)
      .eq('admin_user_id', user.id)
      .single();

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    // Create board member
    const { data: boardMember, error } = await supabase
      .from('board_members')
      .insert({
        building_id: buildingId,
        name,
        role,
        phone: phone || null,
        email: email || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating board member:', error);
      return NextResponse.json(
        { error: 'Failed to create board member' },
        { status: 500 }
      );
    }

    return NextResponse.json(boardMember);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
