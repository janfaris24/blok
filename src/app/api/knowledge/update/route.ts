import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, category, question, answer, keywords, priority, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
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

    // Update entry
    const updateData: any = {};
    if (category !== undefined) updateData.category = category;
    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    if (keywords !== undefined) updateData.keywords = keywords;
    if (priority !== undefined) updateData.priority = priority;
    if (active !== undefined) updateData.active = active;

    const { data: entry, error } = await supabase
      .from('knowledge_base')
      .update(updateData)
      .eq('id', id)
      .eq('building_id', building.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating knowledge base entry:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entry });
  } catch (error: any) {
    console.error('Error in knowledge base update:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
