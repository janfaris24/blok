import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireFeature } from '@/lib/subscription-server';

/**
 * Create a new broadcast
 *
 * POST /api/broadcasts/create
 * Body: {
 *   subject: string;
 *   message: string;
 *   targetAudience: 'all' | 'owners' | 'renters' | 'specific_units';
 *   specificUnitIds?: string[];
 *   sendViaWhatsApp?: boolean;
 *   sendViaEmail?: boolean;
 *   sendViaSMS?: boolean;
 *   scheduledFor?: string (ISO date);
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // FEATURE GATE: Require Professional plan or higher for broadcasts
    try {
      await requireFeature('broadcasts');
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Feature not available on your plan' },
        { status: 403 }
      );
    }

    const {
      subject,
      message,
      targetAudience,
      specificUnitIds = null,
      sendViaWhatsApp = true,
      sendViaEmail = false,
      sendViaSMS = false,
      scheduledFor = null,
    } = await request.json();

    // Validate input
    if (!subject || !message || !targetAudience) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, message, targetAudience' },
        { status: 400 }
      );
    }

    if (targetAudience === 'specific_units' && (!specificUnitIds || specificUnitIds.length === 0)) {
      return NextResponse.json(
        { error: 'specificUnitIds required when targetAudience is specific_units' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get building for this admin
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id')
      .eq('admin_user_id', user.id)
      .single();

    if (buildingError || !building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    // Calculate recipient count based on target audience
    let recipientCount = 0;

    if (targetAudience === 'all') {
      const { count } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('building_id', building.id);
      recipientCount = count || 0;
    } else if (targetAudience === 'owners') {
      const { count } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('building_id', building.id)
        .eq('type', 'owner');
      recipientCount = count || 0;
    } else if (targetAudience === 'renters') {
      const { count } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('building_id', building.id)
        .eq('type', 'renter');
      recipientCount = count || 0;
    } else if (targetAudience === 'specific_units') {
      const { count } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('building_id', building.id)
        .in('unit_id', specificUnitIds);
      recipientCount = count || 0;
    }

    // Create broadcast record
    const { data: broadcast, error: broadcastError } = await supabase
      .from('broadcasts')
      .insert({
        building_id: building.id,
        subject,
        message,
        target_audience: targetAudience,
        specific_unit_ids: specificUnitIds,
        status: scheduledFor ? 'draft' : 'draft',
        total_recipients: recipientCount,
        sent_count: 0,
        failed_count: 0,
        send_via_whatsapp: sendViaWhatsApp,
        send_via_email: sendViaEmail,
        send_via_sms: sendViaSMS,
        scheduled_for: scheduledFor,
      })
      .select()
      .single();

    if (broadcastError) {
      console.error('[Broadcast] Create error:', broadcastError);
      return NextResponse.json(
        { error: 'Failed to create broadcast' },
        { status: 500 }
      );
    }

    console.log('[Broadcast] ✅ Created:', broadcast.id);

    return NextResponse.json({
      success: true,
      broadcast,
    });

  } catch (error) {
    console.error('[Broadcast] Create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
