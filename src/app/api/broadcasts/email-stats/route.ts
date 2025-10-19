import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Get email tracking statistics for a broadcast
 *
 * GET /api/broadcasts/email-stats?broadcastId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const broadcastId = searchParams.get('broadcastId');

    if (!broadcastId) {
      return NextResponse.json(
        { error: 'Missing broadcastId parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get broadcast and verify ownership
    const { data: broadcast, error: broadcastError } = await supabase
      .from('broadcasts')
      .select('building_id')
      .eq('id', broadcastId)
      .single();

    if (broadcastError || !broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    // Verify building ownership
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id')
      .eq('id', broadcast.building_id)
      .eq('admin_user_id', user.id)
      .single();

    if (buildingError || !building) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get email statistics
    const { data: events, error: eventsError } = await supabase
      .from('email_events')
      .select('*')
      .eq('broadcast_id', broadcastId);

    if (eventsError) {
      console.error('[Email Stats] Failed to fetch events:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch email statistics' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      total: events.length,
      sent: events.filter(e => e.event_type === 'email.sent').length,
      delivered: events.filter(e => e.event_type === 'email.delivered').length,
      opened: events.filter(e => e.opened).length,
      clicked: events.filter(e => e.clicked).length,
      bounced: events.filter(e => e.event_type === 'email.bounced').length,
      openRate: 0,
      clickRate: 0,
    };

    // Calculate rates
    if (stats.delivered > 0) {
      stats.openRate = Math.round((stats.opened / stats.delivered) * 100);
      stats.clickRate = Math.round((stats.clicked / stats.delivered) * 100);
    }

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('[Email Stats] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
