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

    // Parse FormData (to support image uploads)
    const formData = await request.formData();

    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const targetAudience = formData.get('targetAudience') as string;
    const specificUnitIds = formData.get('specificUnitIds')
      ? JSON.parse(formData.get('specificUnitIds') as string)
      : null;
    const sendViaWhatsApp = formData.get('sendViaWhatsApp') === 'true';
    const sendViaEmail = formData.get('sendViaEmail') === 'true';
    const sendViaSMS = formData.get('sendViaSMS') === 'true';
    const scheduledFor = formData.get('scheduledFor') as string || null;

    // Get uploaded images
    const images = formData.getAll('images') as File[];

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

    // Create broadcast record (without media URLs first)
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
        has_media: images.length > 0,
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

    // Upload images to Supabase Storage if any
    const mediaUrls: string[] = [];

    if (images.length > 0) {
      console.log(`[Broadcast] Uploading ${images.length} images...`);

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}_${i}.${fileExt}`;
        const filePath = `${building.id}/broadcasts/${broadcast.id}/${fileName}`;

        try {
          // Convert File to ArrayBuffer
          const arrayBuffer = await image.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('blok-media')
            .upload(filePath, buffer, {
              contentType: image.type,
              upsert: false,
            });

          if (uploadError) {
            console.error(`[Broadcast] Image upload error (${fileName}):`, uploadError);
            continue; // Skip this image but continue with others
          }

          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('blok-media')
            .getPublicUrl(filePath);

          mediaUrls.push(publicUrlData.publicUrl);
          console.log(`[Broadcast] ✅ Uploaded image ${i + 1}/${images.length}`);

        } catch (error) {
          console.error(`[Broadcast] Error processing image ${i + 1}:`, error);
          continue;
        }
      }

      // Update broadcast with media URLs
      if (mediaUrls.length > 0) {
        const { error: updateError } = await supabase
          .from('broadcasts')
          .update({ media_urls: mediaUrls })
          .eq('id', broadcast.id);

        if (updateError) {
          console.error('[Broadcast] Failed to update media URLs:', updateError);
        } else {
          console.log(`[Broadcast] ✅ Saved ${mediaUrls.length} media URLs`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      broadcast: {
        ...broadcast,
        media_urls: mediaUrls,
      },
    });

  } catch (error) {
    console.error('[Broadcast] Create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
