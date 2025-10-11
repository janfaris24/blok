import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch comments for a maintenance request
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get maintenance request ID from query params
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Missing required parameter: requestId' },
        { status: 400 }
      );
    }

    // Fetch comments with author name
    const { data: comments, error: fetchError } = await supabase
      .from('maintenance_comments')
      .select('id, comment, created_at, author_id, author_name')
      .eq('maintenance_request_id', requestId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching comments:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: comments || [],
    });

  } catch (error) {
    console.error('Error in GET comments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add a new comment to a maintenance request
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { requestId, comment, sendToResident } = body;

    console.log('📥 Request body:', { requestId, commentLength: comment?.length, sendToResident });

    if (!requestId || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: requestId, comment' },
        { status: 400 }
      );
    }

    // Validate comment is not empty after trimming
    if (comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      );
    }

    // Get author name from current user
    const firstName = user.user_metadata?.first_name;
    const lastName = user.user_metadata?.last_name;
    const authorName = firstName && lastName
      ? `${firstName} ${lastName}`
      : user.email?.split('@')[0] || 'Admin';

    // Insert the comment
    const { data: newComment, error: insertError } = await supabase
      .from('maintenance_comments')
      .insert({
        maintenance_request_id: requestId,
        author_id: user.id,
        author_name: authorName,
        comment: comment.trim(),
      })
      .select('id, comment, created_at, author_id, author_name')
      .single();

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      return NextResponse.json(
        { error: 'Failed to add comment' },
        { status: 500 }
      );
    }

    // If sendToResident is true, send the comment via WhatsApp
    console.log('📤 sendToResident:', sendToResident);

    if (sendToResident) {
      try {
        console.log('🔍 Fetching maintenance request for WhatsApp notification...');

        // Get the maintenance request with resident info
        const { data: maintenanceRequest, error: fetchError } = await supabase
          .from('maintenance_requests')
          .select(`
            id,
            title,
            description,
            residents (
              id,
              first_name,
              last_name,
              whatsapp_number,
              preferred_language,
              opted_in_whatsapp
            ),
            buildings (
              id,
              name,
              whatsapp_business_number
            )
          `)
          .eq('id', requestId)
          .single();

        console.log('📋 Maintenance request data:', {
          found: !!maintenanceRequest,
          error: fetchError,
          resident: maintenanceRequest?.residents,
          building: maintenanceRequest?.buildings,
        });

        if (!fetchError && maintenanceRequest) {
          const resident = maintenanceRequest.residents as any;
          const building = maintenanceRequest.buildings as any;

          console.log('✅ Checking WhatsApp eligibility:', {
            hasOptIn: resident?.opted_in_whatsapp,
            hasNumber: !!resident?.whatsapp_number,
            hasBusinessNumber: !!building?.whatsapp_business_number,
          });

          // Only send if resident has WhatsApp opt-in
          if (resident?.opted_in_whatsapp && resident?.whatsapp_number && building?.whatsapp_business_number) {
            const language = resident.preferred_language || 'es';

            // Create message
            let message = '';
            if (language === 'es') {
              message = `💬 *Nuevo comentario en tu solicitud*\n\n`;
              message += `*Solicitud:* ${maintenanceRequest.title || maintenanceRequest.description}\n`;
              message += `*De:* ${authorName}\n\n`;
              message += `"${comment.trim()}"\n\n`;
              message += `Responde a este mensaje si tienes preguntas.`;
            } else {
              message = `💬 *New comment on your request*\n\n`;
              message += `*Request:* ${maintenanceRequest.title || maintenanceRequest.description}\n`;
              message += `*From:* ${authorName}\n\n`;
              message += `"${comment.trim()}"\n\n`;
              message += `Reply to this message if you have questions.`;
            }

            // Send WhatsApp message via Twilio
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;

            console.log('📞 Twilio credentials check:', {
              hasAccountSid: !!accountSid,
              hasAuthToken: !!authToken,
            });

            if (accountSid && authToken) {
              console.log('📨 Sending WhatsApp message:', {
                from: building.whatsapp_business_number,
                to: resident.whatsapp_number,
                messageLength: message.length,
              });

              const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

              const response = await fetch(twilioUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  From: `whatsapp:${building.whatsapp_business_number}`,
                  To: `whatsapp:${resident.whatsapp_number}`,
                  Body: message,
                }),
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Failed to send WhatsApp comment notification:', errorText);
              } else {
                console.log(`✅ Sent comment notification to ${resident.first_name} ${resident.last_name}`);
              }
            } else {
              console.error('❌ Missing Twilio credentials');
            }
          }
        }
      } catch (notificationError) {
        console.error('Error sending comment notification:', notificationError);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      data: newComment,
    });

  } catch (error) {
    console.error('Error in POST comments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
