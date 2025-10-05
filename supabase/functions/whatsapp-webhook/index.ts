import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// 🏢 CONDOSYNC - AI-Powered Condo Communication Platform
console.log("🏢 CondoSync WhatsApp webhook starting...");

interface IncomingMessageData {
  messageId: string;
  from: string;
  to: string;
  body: string;
  mediaUrl?: string | null;
  mediaContentType?: string | null;
  timestamp: string;
  profileName?: string;
  waId?: string;
}

interface Building {
  id: string;
  name: string;
  whatsapp_business_number: string;
}

interface Resident {
  id: string;
  building_id: string;
  unit_id?: string;
  type: 'owner' | 'renter';
  first_name: string;
  last_name: string;
  phone: string;
  whatsapp_number?: string;
  preferred_language: 'es' | 'en';
  opted_in_whatsapp: boolean;
}

interface AIAnalysisResult {
  intent: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  routeTo: 'owner' | 'renter' | 'admin' | 'both';
  suggestedResponse: string;
  requiresHumanReview: boolean;
  extractedData?: {
    maintenanceCategory?: string;
    urgency?: string;
    location?: string;
    [key: string]: any;
  };
}

// Main webhook handler
Deno.serve(async (req: Request) => {
  try {
    console.log('🏢 CondoSync webhook received');
    const startTime = Date.now();

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await req.text();
    const messageData = parseWebhookData(body);

    if (!messageData || !messageData.body) {
      console.log('⚠️ Invalid message data or empty body');
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    // Initialize Supabase with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Extract phone numbers
    const phoneNumber = messageData.from.replace('whatsapp:', '');
    const buildingNumber = messageData.to.replace('whatsapp:', '');

    console.log(`📞 From: ${phoneNumber}, To: ${buildingNumber}`);

    // 1. Find building by WhatsApp number
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('*')
      .eq('whatsapp_business_number', buildingNumber)
      .single();

    if (buildingError || !building) {
      console.error('❌ Building not found:', buildingNumber);
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    console.log(`✅ Building found: ${building.name}`);

    // 2. Find resident by phone or WhatsApp number
    const { data: resident, error: residentError } = await supabase
      .from('residents')
      .select('*, units!residents_unit_id_fkey(*)')
      .eq('building_id', building.id)
      .or(`phone.eq.${phoneNumber},whatsapp_number.eq.${phoneNumber}`)
      .single();

    if (residentError || !resident) {
      console.error('❌ Resident not found:', phoneNumber);
      console.error('❌ Error details:', JSON.stringify(residentError));

      // Send unknown resident message
      const unknownMsg = 'Lo siento, no te reconozco en nuestro sistema. Por favor contacta a la administración del edificio.';
      await sendWhatsAppMessage(phoneNumber, buildingNumber, unknownMsg);

      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    console.log(`✅ Resident found: ${resident.first_name} ${resident.last_name} (${resident.type})`);

    // 3. Find or create conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('building_id', building.id)
      .eq('resident_id', resident.id)
      .eq('channel', 'whatsapp')
      .eq('status', 'active')
      .maybeSingle();

    if (!conversation) {
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          building_id: building.id,
          resident_id: resident.id,
          channel: 'whatsapp',
          status: 'active',
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create conversation:', createError);
        throw createError;
      }

      conversation = newConversation;
      console.log('✅ Created new conversation');
    } else {
      console.log('✅ Using existing conversation');
    }

    // 4. Analyze message with AI
    console.log('🤖 Analyzing message with Claude AI...');
    const analysis = await analyzeMessage(
      messageData.body,
      resident.type,
      resident.preferred_language || 'es',
      building.name
    );

    console.log(`✅ AI Analysis: intent=${analysis.intent}, priority=${analysis.priority}, routeTo=${analysis.routeTo}`);

    // 5. Save incoming message to database
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_type: 'resident',
      sender_id: resident.id,
      content: messageData.body,
      intent: analysis.intent,
      ai_response: analysis.suggestedResponse,
      channel: 'whatsapp',
      routed_to: analysis.routeTo,
      metadata: { whatsapp_sid: messageData.messageId },
    });

    console.log('✅ Message saved to database');

    // 6. Create maintenance request if AI detected one
    if (analysis.intent === 'maintenance_request') {
      await supabase.from('maintenance_requests').insert({
        building_id: building.id,
        unit_id: resident.unit_id,
        resident_id: resident.id,
        title: analysis.extractedData?.maintenanceCategory || 'Solicitud de Mantenimiento',
        description: messageData.body,
        category: analysis.extractedData?.maintenanceCategory,
        priority: analysis.priority,
        extracted_by_ai: true,
        conversation_id: conversation.id,
      });

      console.log('✅ Maintenance request created');
    }

    // 7. Send response to resident
    let responseMessage: string;

    if (!analysis.requiresHumanReview && analysis.suggestedResponse) {
      // Send AI's suggested response
      responseMessage = analysis.suggestedResponse;
      console.log('✅ Sending AI auto-response');
    } else {
      // Send acknowledgment for issues requiring human review
      responseMessage = resident.preferred_language === 'en'
        ? `Thank you for contacting us. Your ${analysis.intent === 'maintenance_request' ? 'maintenance request' : 'message'} has been received and forwarded to our team. We'll respond as soon as possible.`
        : `Gracias por contactarnos. Tu ${analysis.intent === 'maintenance_request' ? 'solicitud de mantenimiento' : 'mensaje'} ha sido recibida y enviada a nuestro equipo. Te responderemos lo antes posible.`;

      console.log('✅ Sending acknowledgment (requires human review)');
    }

    await sendWhatsAppMessage(
      phoneNumber,
      buildingNumber,
      responseMessage
    );

    // Save response message
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_type: 'ai',
      content: responseMessage,
      channel: 'whatsapp',
    });

    console.log('✅ Response sent to resident');

    // 8. Route message to owner/admin if needed
    if (analysis.routeTo === 'owner' && resident.type === 'renter') {
      await routeToOwner(resident, building, messageData.body, supabase);
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation.id);

    console.log(`✅ CondoSync processed in ${Date.now() - startTime}ms`);

    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'application/xml' }
    });

  } catch (error) {
    console.error('❌ CondoSync error:', error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
});

// Parse Twilio webhook data
function parseWebhookData(body: string): IncomingMessageData | null {
  try {
    const params = new URLSearchParams(body);
    return {
      messageId: params.get('MessageSid') || '',
      from: params.get('From') || '',
      to: params.get('To') || '',
      body: params.get('Body') || '',
      mediaUrl: params.get('MediaUrl0') || null,
      mediaContentType: params.get('MediaContentType0') || null,
      timestamp: new Date().toISOString(),
      profileName: params.get('ProfileName') || '',
      waId: params.get('WaId') || ''
    };
  } catch (error) {
    console.error('Error parsing webhook data:', error);
    return null;
  }
}

// AI Message Analysis using Claude
async function analyzeMessage(
  message: string,
  residentType: 'owner' | 'renter',
  language: 'es' | 'en' = 'es',
  buildingContext?: string
): Promise<AIAnalysisResult> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!anthropicApiKey) {
    console.error('❌ ANTHROPIC_API_KEY not set');
    return getFallbackResponse(language);
  }

  const prompt = buildAIPrompt(message, residentType, language, buildingContext);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.content?.[0]?.text;

    if (content) {
      let jsonText = content.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText
          .replace(/^```(?:json)?\s*\n?/i, '')
          .replace(/\n?```\s*$/i, '');
      }

      const parsed: AIAnalysisResult = JSON.parse(jsonText);
      console.log('🤖 AI analysis successful');
      return parsed;
    }

    throw new Error('Empty response from Claude');

  } catch (error) {
    console.error('AI analysis error:', error);
    return getFallbackResponse(language);
  }
}

// Build AI prompt for message analysis
function buildAIPrompt(
  message: string,
  residentType: 'owner' | 'renter',
  language: 'es' | 'en',
  buildingContext?: string
): string {
  const isSpanish = language === 'es';

  return isSpanish ? `
Eres un asistente AI para CondoSync, un sistema de gestión de condominios en Puerto Rico.

CONTEXTO:
- Tipo de residente: ${residentType === 'owner' ? 'Propietario' : 'Inquilino'}
- Idioma: Español
- Edificio: ${buildingContext || 'N/A'}

MENSAJE DEL RESIDENTE:
"${message}"

TAREA: Analiza este mensaje y responde en formato JSON con estos campos:

1. **intent**: Clasifica el mensaje como uno de:
   - maintenance_request (reparaciones, problemas en unidad o áreas comunes)
   - general_question (reglas, horarios, amenidades)
   - noise_complaint (quejas de ruido)
   - visitor_access (estacionamiento visitantes, códigos de entrada)
   - hoa_fee_question (preguntas sobre cuotas)
   - amenity_reservation (reservar piscina, salón de fiestas)
   - document_request (reglamentos, estados financieros)
   - emergency (incendio, inundación, amenaza de seguridad)
   - other

2. **priority**: low | medium | high | emergency

3. **routeTo**: ¿Quién debe manejar esto?
   - 'admin' = Administrador debe responder
   - 'owner' = Enviar al dueño (si el remitente es inquilino)
   - 'renter' = Enviar al inquilino (si el remitente es dueño)
   - 'both' = Notificar a ambos

4. **suggestedResponse**: Respuesta útil en español (2-3 oraciones)
   - Profesional, cálida y concisa
   - Si es mantenimiento, confirma recepción y di que admin revisará
   - Si es pregunta que puedes responder, provee la respuesta
   - Si no sabes, di que admin responderá en 24 horas

5. **requiresHumanReview**: true si admin DEBE revisar (emergencias, quejas, problemas complejos)

6. **extractedData**: Extrae detalles relevantes (categoría, urgencia, ubicación, etc.)

RESPUESTA (solo JSON, sin markdown):
{
  "intent": "maintenance_request",
  "priority": "high",
  "routeTo": "admin",
  "suggestedResponse": "Hemos recibido tu solicitud de mantenimiento. Un miembro del equipo revisará esto dentro de 24 horas. ¡Gracias por reportarlo!",
  "requiresHumanReview": true,
  "extractedData": {
    "maintenanceCategory": "hvac",
    "urgency": "high",
    "location": "unit"
  }
}
` : `
You are an AI assistant for CondoSync, a Puerto Rico condominium management system.

CONTEXT:
- Resident type: ${residentType === 'owner' ? 'Owner' : 'Renter'}
- Language: English
- Building: ${buildingContext || 'N/A'}

MESSAGE FROM RESIDENT:
"${message}"

TASK: Analyze this message and respond in JSON format with these fields:

1. **intent**: Classify as one of:
   - maintenance_request (repairs, issues in unit or common areas)
   - general_question (HOA rules, amenities, hours)
   - noise_complaint
   - visitor_access (guest parking, entrance codes)
   - hoa_fee_question
   - amenity_reservation (pool, gym, party room)
   - document_request (bylaws, financial statements)
   - emergency (fire, flood, security threat)
   - other

2. **priority**: low | medium | high | emergency

3. **routeTo**: Who should handle this?
   - 'admin' = Building admin/manager must respond
   - 'owner' = Forward to unit owner (if sender is renter)
   - 'renter' = Forward to renter (if sender is owner)
   - 'both' = Notify both owner and renter

4. **suggestedResponse**: Helpful response in English (2-3 sentences)
   - Professional, warm, and concise
   - If maintenance, acknowledge and say admin will review
   - If question you can answer, provide the answer
   - If you don't know, say admin will follow up within 24 hours

5. **requiresHumanReview**: true if admin MUST review (emergencies, complaints, complex issues)

6. **extractedData**: Extract relevant details (category, urgency, location, etc.)

RESPONSE (JSON only, no markdown):
{
  "intent": "maintenance_request",
  "priority": "high",
  "routeTo": "admin",
  "suggestedResponse": "We received your maintenance request. A team member will review this within 24 hours. Thank you for reporting!",
  "requiresHumanReview": true,
  "extractedData": {
    "maintenanceCategory": "hvac",
    "urgency": "high",
    "location": "unit"
  }
}
`;
}

// Fallback response when AI fails
function getFallbackResponse(language: 'es' | 'en'): AIAnalysisResult {
  return {
    intent: 'other',
    priority: 'medium',
    routeTo: 'admin',
    suggestedResponse: language === 'es'
      ? 'Hemos recibido tu mensaje. Un administrador te responderá pronto.'
      : 'We received your message. An administrator will respond soon.',
    requiresHumanReview: true
  };
}

// Route message to owner
async function routeToOwner(
  resident: any,
  building: Building,
  message: string,
  supabase: any
): Promise<void> {
  try {
    if (!resident.unit_id) {
      console.log('⚠️ Resident has no unit_id, cannot route to owner');
      return;
    }

    const { data: unit } = await supabase
      .from('units')
      .select(`
        *,
        owner:residents!units_owner_id_fkey (
          id,
          first_name,
          last_name,
          whatsapp_number,
          opted_in_whatsapp,
          preferred_language
        )
      `)
      .eq('id', resident.unit_id)
      .single();

    if (!unit?.owner) {
      console.log('⚠️ No owner found for unit');
      return;
    }

    const owner = unit.owner;

    if (owner.whatsapp_number && owner.opted_in_whatsapp) {
      const forwardMessage = `📨 *Mensaje de inquilino - Unidad ${unit.unit_number}*\n\n${message}\n\n_Este mensaje fue enviado por ${resident.first_name} ${resident.last_name}_`;

      await sendWhatsAppMessage(
        owner.whatsapp_number,
        building.whatsapp_business_number,
        forwardMessage
      );

      console.log(`✅ Message forwarded to owner: ${owner.first_name} ${owner.last_name}`);
    } else {
      console.log('⚠️ Owner not opted in to WhatsApp or no number');
    }
  } catch (error) {
    console.error('❌ Error routing to owner:', error);
  }
}

// Send WhatsApp message via Twilio
async function sendWhatsAppMessage(
  to: string,
  from: string,
  message: string,
  retryCount = 0
): Promise<void> {
  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      throw new Error('Missing Twilio credentials');
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(accountSid + ':' + authToken)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${from}`,
          To: `whatsapp:${to}`,
          Body: message,
        }),
      }
    );

    if (response.ok) {
      console.log('📤 WhatsApp message sent successfully');
    } else {
      const responseText = await response.text();
      console.error(`❌ Failed to send WhatsApp: ${response.status} - ${responseText}`);

      // Retry on rate limiting
      if (response.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 2000;
        console.log(`⏳ Rate limited. Retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return await sendWhatsAppMessage(to, from, message, retryCount + 1);
      }

      throw new Error(`Twilio API error: ${response.status}`);
    }
  } catch (error) {
    console.error('💥 Error sending WhatsApp:', error);
    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return await sendWhatsAppMessage(to, from, message, retryCount + 1);
    }
    throw error;
  }
}
