import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const buildingId = searchParams.get('building_id');

    if (!query || !buildingId) {
      return NextResponse.json(
        { error: 'Query and building_id are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Search using keywords array and text matching
    const { data: entries, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('building_id', buildingId)
      .eq('active', true)
      .or(`question.ilike.%${query}%,answer.ilike.%${query}%,keywords.cs.{${query}}`)
      .order('priority', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error searching knowledge base:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entries: entries || [] });
  } catch (error: any) {
    console.error('Error in knowledge base search:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
