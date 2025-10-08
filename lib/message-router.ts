import { createClient } from '@/lib/supabase-server';
import { sendWhatsAppMessage } from '@/lib/whatsapp-client';
import type { AIAnalysisResult, Resident, Unit } from '@/types/blok';

/**
 * Routes a message based on AI analysis and resident type
 *
 * @param analysis - AI analysis result
 * @param residentId - ID of the resident who sent the message
 * @param buildingId - ID of the building
 * @param originalMessage - The original message text
 */
export async function routeMessage(
  analysis: AIAnalysisResult,
  residentId: string,
  buildingId: string,
  originalMessage: string
): Promise<void> {
  const supabase = await createClient();

  // Get resident and unit info
  const { data: resident, error: residentError } = await supabase
    .from('residents')
    .select(`
      *,
      units (
        *,
        owner:residents!units_owner_id_fkey (
          id,
          first_name,
          last_name,
          whatsapp_number,
          opted_in_whatsapp,
          preferred_language
        ),
        renter:residents!units_current_renter_id_fkey (
          id,
          first_name,
          last_name,
          whatsapp_number,
          opted_in_whatsapp,
          preferred_language
        )
      )
    `)
    .eq('id', residentId)
    .single();

  if (residentError || !resident) {
    console.error('[Router] Failed to fetch resident:', residentError);
    return;
  }

  // Get building info
  const { data: building, error: buildingError } = await supabase
    .from('buildings')
    .select('whatsapp_business_number')
    .eq('id', buildingId)
    .single();

  if (buildingError || !building?.whatsapp_business_number) {
    console.error('[Router] Building WhatsApp number not configured');
    return;
  }

  const unit = (resident as any).units;

  // Route to owner if renter sent message and AI says route to owner
  if (analysis.routeTo === 'owner' && resident.type === 'renter' && unit) {
    const owner = unit.owner;

    if (owner?.whatsapp_number && owner.opted_in_whatsapp) {
      const forwardMessage = `📨 *Mensaje de inquilino - Unidad ${unit.unit_number}*\n\n${originalMessage}\n\n_Este mensaje fue enviado por ${resident.first_name} ${resident.last_name}_`;

      try {
        await sendWhatsAppMessage(
          owner.whatsapp_number,
          building.whatsapp_business_number,
          forwardMessage
        );

        console.log(`[Router] ✅ Forwarded to owner: ${owner.first_name} ${owner.last_name}`);
      } catch (error) {
        console.error('[Router] ❌ Failed to forward to owner:', error);
      }
    } else {
      console.log('[Router] ⚠️ Owner not opted in to WhatsApp or no number');
    }
  }

  // Route to renter if owner sent message and AI says route to renter
  if (analysis.routeTo === 'renter' && resident.type === 'owner' && unit) {
    const renter = unit.renter;

    if (renter?.whatsapp_number && renter.opted_in_whatsapp) {
      const forwardMessage = `📨 *Mensaje del propietario - Unidad ${unit.unit_number}*\n\n${originalMessage}\n\n_Este mensaje fue enviado por ${resident.first_name} ${resident.last_name}_`;

      try {
        await sendWhatsAppMessage(
          renter.whatsapp_number,
          building.whatsapp_business_number,
          forwardMessage
        );

        console.log(`[Router] ✅ Forwarded to renter: ${renter.first_name} ${renter.last_name}`);
      } catch (error) {
        console.error('[Router] ❌ Failed to forward to renter:', error);
      }
    } else {
      console.log('[Router] ⚠️ Renter not opted in to WhatsApp or no number');
    }
  }

  // Route to both if specified
  if (analysis.routeTo === 'both' && unit) {
    const owner = unit.owner;
    const renter = unit.renter;

    const forwardMessage = `📨 *Mensaje importante - Unidad ${unit.unit_number}*\n\n${originalMessage}\n\n_Mensaje enviado por ${resident.first_name} ${resident.last_name}_`;

    // Send to owner
    if (owner?.whatsapp_number && owner.opted_in_whatsapp && owner.id !== residentId) {
      try {
        await sendWhatsAppMessage(
          owner.whatsapp_number,
          building.whatsapp_business_number,
          forwardMessage
        );
        console.log(`[Router] ✅ Forwarded to owner`);
      } catch (error) {
        console.error('[Router] ❌ Failed to forward to owner:', error);
      }
    }

    // Send to renter
    if (renter?.whatsapp_number && renter.opted_in_whatsapp && renter.id !== residentId) {
      try {
        await sendWhatsAppMessage(
          renter.whatsapp_number,
          building.whatsapp_business_number,
          forwardMessage
        );
        console.log(`[Router] ✅ Forwarded to renter`);
      } catch (error) {
        console.error('[Router] ❌ Failed to forward to renter:', error);
      }
    }
  }

  // If requiresHumanReview, we could send email/notification to admin here
  if (analysis.requiresHumanReview) {
    console.log(`[Router] ⚠️ Message requires human review - Admin should be notified`);
    // TODO: Implement admin notification (email, dashboard alert, etc.)
  }
}
