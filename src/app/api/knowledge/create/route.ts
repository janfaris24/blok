import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, question, answer, keywords, priority } = body;

    // Validation
    if (!category || !question || !answer) {
      return NextResponse.json(
        { error: 'Category, question, and answer are required' },
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

    // Create knowledge base entry
    const { data: entry, error } = await supabase
      .from('knowledge_base')
      .insert({
        building_id: building.id,
        category,
        question,
        answer,
        keywords: keywords || [],
        priority: priority || 0,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating knowledge base entry:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: any) {
    console.error('Error in knowledge base create:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
