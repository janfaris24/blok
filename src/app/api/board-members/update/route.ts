import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, name, role, phone, email } = body;

    if (!id || !name || !role) {
      return NextResponse.json(
        { error: 'ID, name, and role are required' },
        { status: 400 }
      );
    }

    // Verify user has access to this board member
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update board member (RLS policy will ensure user owns the building)
    const { data: boardMember, error } = await supabase
      .from('board_members')
      .update({
        name,
        role,
        phone: phone || null,
        email: email || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating board member:', error);
      return NextResponse.json(
        { error: 'Failed to update board member' },
        { status: 500 }
      );
    }

    if (!boardMember) {
      return NextResponse.json({ error: 'Board member not found' }, { status: 404 });
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
