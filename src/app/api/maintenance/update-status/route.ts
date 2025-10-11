import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

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
    const { requestId, newStatus } = body;

    if (!requestId || !newStatus) {
      return NextResponse.json(
        { error: 'Missing required fields: requestId, newStatus' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: open, in_progress, resolved, closed' },
        { status: 400 }
      );
    }

    // Get the maintenance request with resident info
    const { data: maintenanceRequest, error: fetchError } = await supabase
      .from('maintenance_requests')
      .select(`
        id,
        title,
        description,
        category,
        priority,
        status,
        reported_at,
        resident_id,
        building_id,
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

    if (fetchError || !maintenanceRequest) {
      return NextResponse.json(
        { error: 'Maintenance request not found' },
        { status: 404 }
      );
    }

    // Update the status
    const updateData: any = {
      status: newStatus,
    };

    // If status is resolved or closed, set resolved_at
    if (newStatus === 'resolved' || newStatus === 'closed') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from('maintenance_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating maintenance request:', updateError);
      return NextResponse.json(
        { error: 'Failed to update maintenance request' },
        { status: 500 }
      );
    }

    // If status changed to closed, send WhatsApp notification to resident
    if (newStatus === 'closed' && maintenanceRequest.residents && maintenanceRequest.buildings) {
      const resident = maintenanceRequest.residents as any;
      const building = maintenanceRequest.buildings as any;

      // Only send if resident has WhatsApp opt-in
      if (resident.opted_in_whatsapp && resident.whatsapp_number && building.whatsapp_business_number) {
        try {
          const language = resident.preferred_language || 'es';

          // Format the date
          const reportedDate = new Date(maintenanceRequest.reported_at).toLocaleDateString(
            language === 'es' ? 'es-PR' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
          );

          const closedDate = new Date().toLocaleDateString(
            language === 'es' ? 'es-PR' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
          );

          // Create closing message
          let message = '';
          if (language === 'es') {
            message = `✅ *Tu solicitud ha sido cerrada*\n\n`;
            message += `*Descripción:* ${maintenanceRequest.title || maintenanceRequest.description}\n`;
            message += `*Categoría:* ${maintenanceRequest.category}\n`;
            message += `*Fecha reportada:* ${reportedDate}\n`;
            message += `*Fecha cerrada:* ${closedDate}\n\n`;
            message += `Gracias por usar nuestro sistema de mantenimiento. Si tienes alguna pregunta o necesitas reportar algo más, no dudes en escribirnos.`;
          } else {
            message = `✅ *Your request has been closed*\n\n`;
            message += `*Description:* ${maintenanceRequest.title || maintenanceRequest.description}\n`;
            message += `*Category:* ${maintenanceRequest.category}\n`;
            message += `*Date reported:* ${reportedDate}\n`;
            message += `*Date closed:* ${closedDate}\n\n`;
            message += `Thank you for using our maintenance system. If you have any questions or need to report something else, feel free to message us.`;
          }

          // Send WhatsApp message via Twilio
          const accountSid = process.env.TWILIO_ACCOUNT_SID;
          const authToken = process.env.TWILIO_AUTH_TOKEN;

          if (!accountSid || !authToken) {
            console.error('Missing Twilio credentials');
          } else {
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
              console.error('Failed to send WhatsApp notification:', errorText);
            } else {
              console.log(`✅ Sent closing notification to ${resident.first_name} ${resident.last_name}`);
            }
          }
        } catch (notificationError) {
          console.error('Error sending closing notification:', notificationError);
          // Don't fail the request if notification fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    });

  } catch (error) {
    console.error('Error in update-status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
