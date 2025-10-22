import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { feeId } = body;

    if (!feeId) {
      return NextResponse.json({ error: 'Fee ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get user's building
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: building } = await supabase
      .from('buildings')
      .select('id, name, whatsapp_business_number')
      .eq('admin_user_id', user.id)
      .single();

    if (!building) {
      return NextResponse.json({ error: 'No building found for user' }, { status: 403 });
    }

    if (!building.whatsapp_business_number) {
      return NextResponse.json({ error: 'Building WhatsApp number not configured' }, { status: 400 });
    }

    // Get fee with unit and resident info
    const { data: fee, error: feeError } = await supabase
      .from('maintenance_fees')
      .select(`
        *,
        unit:units (
          id,
          unit_number,
          is_rented,
          owner:residents!units_owner_id_fkey (
            id,
            first_name,
            last_name,
            whatsapp_number,
            preferred_language,
            opted_in_whatsapp
          ),
          renter:residents!units_current_renter_id_fkey (
            id,
            first_name,
            last_name,
            whatsapp_number,
            preferred_language,
            opted_in_whatsapp
          )
        )
      `)
      .eq('id', feeId)
      .eq('building_id', building.id)
      .single();

    if (feeError || !fee) {
      console.error('Error fetching fee:', feeError);
      return NextResponse.json({ error: 'Fee not found or unauthorized' }, { status: 403 });
    }

    // Determine who to send reminder to (owner is responsible for payment)
    const resident = fee.unit.owner;

    if (!resident || !resident.whatsapp_number || !resident.opted_in_whatsapp) {
      return NextResponse.json({ error: 'Owner not found or WhatsApp not opted in' }, { status: 400 });
    }

    // Build reminder message based on language
    const isSpanish = resident.preferred_language === 'es';
    const dueDate = new Date(fee.due_date).toLocaleDateString(isSpanish ? 'es-PR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const lateFeeText = fee.late_fee > 0
      ? isSpanish
        ? `\n\n⚠️ *Cargo por atraso:* $${fee.late_fee.toFixed(2)}`
        : `\n\n⚠️ *Late fee:* $${fee.late_fee.toFixed(2)}`
      : '';

    const message = isSpanish
      ? `Hola ${resident.first_name},

🏢 *Recordatorio de Cuota de Mantenimiento*
*Edificio:* ${building.name}
*Unidad:* ${fee.unit.unit_number}

💰 *Monto:* $${fee.amount.toFixed(2)}${lateFeeText}
📅 *Vencimiento:* ${dueDate}
${fee.status === 'late' ? '\n⚠️ *Estado:* Atrasado' : ''}

Por favor realiza tu pago lo antes posible. Si ya pagaste, ignora este mensaje.

Para cualquier pregunta, responde a este mensaje.`
      : `Hello ${resident.first_name},

🏢 *Maintenance Fee Reminder*
*Building:* ${building.name}
*Unit:* ${fee.unit.unit_number}

💰 *Amount:* $${fee.amount.toFixed(2)}${lateFeeText}
📅 *Due Date:* ${dueDate}
${fee.status === 'late' ? '\n⚠️ *Status:* Late' : ''}

Please make your payment as soon as possible. If you've already paid, please disregard this message.

For any questions, reply to this message.`;

    // Send WhatsApp message
    try {
      await sendWhatsAppMessage(
        resident.whatsapp_number,
        building.whatsapp_business_number,
        message
      );

      // Update reminder_sent_at and reminder_count
      await supabase
        .from('maintenance_fees')
        .update({
          reminder_sent_at: new Date().toISOString(),
          reminder_count: (fee.reminder_count || 0) + 1,
        })
        .eq('id', feeId);

      // Find or create conversation with resident
      let { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('building_id', building.id)
        .eq('resident_id', resident.id)
        .eq('channel', 'whatsapp')
        .eq('status', 'active')
        .maybeSingle();

      if (!conversation) {
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert({
            building_id: building.id,
            resident_id: resident.id,
            channel: 'whatsapp',
            status: 'active',
          })
          .select()
          .single();

        conversation = newConversation;
      }

      // Save reminder message to conversation
      if (conversation) {
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          sender_type: 'admin',
          content: message,
          intent: 'payment_reminder',
          channel: 'whatsapp',
          metadata: {
            fee_id: feeId,
            reminder_count: (fee.reminder_count || 0) + 1,
          },
        });

        // Update conversation last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversation.id);
      }

      return NextResponse.json({
        success: true,
        message: 'Reminder sent successfully'
      });

    } catch (whatsappError) {
      console.error('Error sending WhatsApp reminder:', whatsappError);
      return NextResponse.json({ error: 'Failed to send WhatsApp reminder' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in payment reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
