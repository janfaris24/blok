import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Get the next upcoming asamblea for a building
 * Used by AI to answer resident questions
 * GET /api/asambleas/next?building_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('building_id');

    if (!buildingId) {
      return NextResponse.json(
        { error: 'building_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get next upcoming asamblea (scheduled and in the future)
    const { data: nextAsamblea, error } = await supabase
      .from('asambleas')
      .select('*')
      .eq('building_id', buildingId)
      .eq('status', 'scheduled')
      .gte('meeting_date', new Date().toISOString())
      .order('meeting_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching next asamblea:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ asamblea: nextAsamblea });
  } catch (error: any) {
    console.error('Error in next asamblea:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
