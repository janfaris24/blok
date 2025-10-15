import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// 🏢 BLOK - AI-Powered Condo Communication Platform
console.log("🏢 Blok WhatsApp webhook starting...");

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
    console.log('🏢 Blok webhook received');
    const startTime = Date.now();

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await req.text();
    console.log('📨 Raw webhook body received');
    const messageData = parseWebhookData(body);

    // Debug: Log all incoming parameters
    console.log('🔍 Webhook data:', JSON.stringify({
      hasBody: !!messageData?.body,
      hasMediaUrl: !!messageData?.mediaUrl,
      hasMediaContentType: !!messageData?.mediaContentType,
      mediaUrl: messageData?.mediaUrl?.substring(0, 50) || 'none',
      mediaType: messageData?.mediaContentType || 'none',
    }));

    if (!messageData) {
      console.log('⚠️ Invalid message data');
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    // Allow messages with either body text OR media
    if (!messageData.body && !messageData.mediaUrl) {
      console.log('⚠️ Message has no text and no media');
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

    console.log(`✅ [${Date.now() - startTime}ms] Building found: ${building.name}`);

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

    console.log(`✅ [${Date.now() - startTime}ms] Resident found: ${resident.first_name} ${resident.last_name} (${resident.type})`);

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

    // 4. ⚡ INSTANT ACKNOWLEDGMENT - COMMENTED OUT TO TEST HAIKU 4.5 SPEED
    // const isSpanish = (resident.preferred_language || 'es') === 'es';
    // const quickAck = isSpanish
    //   ? '⏳ Un momento, estoy buscando esa información...'
    //   : '⏳ One moment, looking that up for you...';

    // console.log(`⚡ [${Date.now() - startTime}ms] Sending instant acknowledgment...`);
    // await sendWhatsAppMessage(phoneNumber, buildingNumber, quickAck);
    // console.log(`✅ [${Date.now() - startTime}ms] Instant ack sent`);

    // 4.5. 📸 MEDIA PROCESSING - Download and store media if present
    let storedMediaUrl: string | null = null;
    let storedMediaPath: string | null = null;
    let mediaType: string | null = null;

    if (messageData.mediaUrl && messageData.mediaContentType) {
      console.log(`📸 [${Date.now() - startTime}ms] Media detected: ${messageData.mediaContentType}`);

      try {
        const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
        const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')!;

        // Download from Twilio
        console.log(`📥 [${Date.now() - startTime}ms] Downloading media from Twilio...`);
        const mediaData = await downloadMediaFromTwilio(
          messageData.mediaUrl,
          accountSid,
          authToken
        );

        // Upload to Supabase Storage
        console.log(`☁️ [${Date.now() - startTime}ms] Uploading to Supabase Storage...`);
        const { url, path } = await uploadMediaToStorage(
          supabase,
          mediaData,
          messageData.mediaContentType,
          building.id,
          messageData.messageId
        );

        storedMediaUrl = url;
        storedMediaPath = path;
        mediaType = messageData.mediaContentType;

        console.log(`✅ [${Date.now() - startTime}ms] Media stored successfully`);
        console.log(`🔗 [${Date.now() - startTime}ms] Media URL: ${storedMediaUrl}`);
      } catch (error) {
        console.error(`❌ [${Date.now() - startTime}ms] Failed to process media:`, error);
        // Continue without media - don't block the message flow
      }
    } else {
      console.log(`📝 [${Date.now() - startTime}ms] Text-only message (no media)`);
    }

    // 5. Analyze message with AI (with knowledge base lookup)
    console.log(`🤖 [${Date.now() - startTime}ms] Analyzing message with Claude AI...`);
    const analysis = await analyzeMessage(
      messageData.body || (storedMediaUrl ? 'Imagen enviada' : ''),
      resident.type,
      resident.preferred_language || 'es',
      building.name,
      building.id,
      supabase
    );

    console.log(`✅ [${Date.now() - startTime}ms] AI Analysis complete: intent=${analysis.intent}, priority=${analysis.priority}, routeTo=${analysis.routeTo}`);

    // 5. Save incoming message to database
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_type: 'resident',
      sender_id: resident.id,
      content: messageData.body || (storedMediaUrl ? '📎 Media message' : ''),
      intent: analysis.intent,
      ai_response: analysis.suggestedResponse,
      channel: 'whatsapp',
      routed_to: analysis.routeTo,
      media_url: storedMediaUrl,
      media_type: mediaType,
      media_storage_path: storedMediaPath,
      metadata: {
        whatsapp_sid: messageData.messageId,
        twilio_media_url: messageData.mediaUrl, // Keep original for reference
      },
    });

    console.log(`✅ Message saved to database${storedMediaUrl ? ' (with media)' : ''}`);

    // 6. Create maintenance request if AI detected one
    if (analysis.intent === 'maintenance_request') {
      // Determine initial status based on maintenance model
      const isResidentResponsibility = building.maintenance_model === 'resident_responsibility';
      const initialStatus = isResidentResponsibility ? 'referred_to_provider' : 'open';

      await supabase.from('maintenance_requests').insert({
        building_id: building.id,
        unit_id: resident.unit_id,
        resident_id: resident.id,
        title: analysis.extractedData?.maintenanceCategory || 'Solicitud de Mantenimiento',
        description: messageData.body,
        category: analysis.extractedData?.maintenanceCategory,
        priority: analysis.priority,
        status: initialStatus,
        responsibility_type: building.maintenance_model,
        extracted_by_ai: true,
        conversation_id: conversation.id,
        photo_urls: storedMediaUrl ? [storedMediaUrl] : null,
        has_photos: !!storedMediaUrl,
      });

      console.log(`✅ Maintenance request created (${building.maintenance_model}, status: ${initialStatus})${storedMediaUrl ? ' with photo attachment' : ''}`);

      // 6.5. Send recommended service providers if Puerto Rico model
      if (building.maintenance_model === 'resident_responsibility' && analysis.extractedData?.maintenanceCategory) {
        console.log(`🔧 [${Date.now() - startTime}ms] Fetching recommended providers for category: ${analysis.extractedData.maintenanceCategory}`);

        try {
          const { data: providers } = await supabase
            .from('service_providers')
            .select('*')
            .eq('building_id', building.id)
            .eq('category', analysis.extractedData.maintenanceCategory)
            .eq('is_recommended', true)
            .order('rating', { ascending: false, nullsFirst: false })
            .limit(5);

          if (providers && providers.length > 0) {
            const language = resident.preferred_language || 'es';
            const categoryLabels: Record<string, { es: string; en: string }> = {
              plumber: { es: 'plomería', en: 'plumbing' },
              electrician: { es: 'electricidad', en: 'electrical' },
              handyman: { es: 'mantenimiento general', en: 'general maintenance' },
              ac_technician: { es: 'aire acondicionado', en: 'air conditioning' },
              washer_dryer_technician: { es: 'lavadora/secadora', en: 'washer/dryer' },
              painter: { es: 'pintura', en: 'painting' },
              locksmith: { es: 'cerrajería', en: 'locksmith' },
              pest_control: { es: 'control de plagas', en: 'pest control' },
              cleaning: { es: 'limpieza', en: 'cleaning' },
              security: { es: 'seguridad', en: 'security' },
              landscaping: { es: 'jardinería', en: 'landscaping' },
              elevator: { es: 'ascensor', en: 'elevator' },
              pool_maintenance: { es: 'mantenimiento de piscina', en: 'pool maintenance' },
              other: { es: 'otros servicios', en: 'other services' },
            };

            const categoryLabel = categoryLabels[analysis.extractedData.maintenanceCategory]?.[language] || analysis.extractedData.maintenanceCategory;

            let providersMessage = language === 'es'
              ? `\n\n🔧 *Proveedores Recomendados para ${categoryLabel}:*\n\n`
              : `\n\n🔧 *Recommended Providers for ${categoryLabel}:*\n\n`;

            providers.forEach((provider: any, index: number) => {
              providersMessage += `${index + 1}. *${provider.name}*\n`;
              if (provider.whatsapp_number) {
                providersMessage += `   📱 WhatsApp: ${provider.whatsapp_number}\n`;
              }
              if (provider.phone) {
                providersMessage += `   ☎️ ${language === 'es' ? 'Teléfono' : 'Phone'}: ${provider.phone}\n`;
              }
              if (provider.rating) {
                providersMessage += `   ⭐ ${language === 'es' ? 'Calificación' : 'Rating'}: ${provider.rating}/5\n`;
              }
              providersMessage += '\n';
            });

            providersMessage += language === 'es'
              ? 'Puedes contactar directamente a cualquiera de estos proveedores.'
              : 'You can contact any of these providers directly.';

            // Send providers message
            await sendWhatsAppMessage(phoneNumber, buildingNumber, providersMessage);

            // Save providers message to conversation
            await supabase.from('messages').insert({
              conversation_id: conversation.id,
              sender_type: 'ai',
              content: providersMessage,
              channel: 'whatsapp',
            });

            console.log(`✅ [${Date.now() - startTime}ms] Sent ${providers.length} recommended providers`);
          }
        } catch (error) {
          console.error('Error fetching/sending providers:', error);
          // Don't fail the whole flow if provider recommendations fail
        }
      }
    }

    // 6.6. Handle status inquiry - fetch and send resident's tickets
    if (analysis.intent === 'status_inquiry') {
      console.log(`📋 [${Date.now() - startTime}ms] Status inquiry detected, fetching resident's requests...`);

      const { requests, total } = await getResidentMaintenanceRequests(
        supabase,
        resident.id,
        building.id
      );

      const statusResponse = formatMaintenanceRequestsResponse(
        requests,
        total,
        resident.preferred_language || 'es'
      );

      console.log(`✅ [${Date.now() - startTime}ms] Found ${requests.length} of ${total} active requests`);

      // Send status response immediately
      await sendWhatsAppMessage(phoneNumber, buildingNumber, statusResponse);

      // Save status response message
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_type: 'ai',
        content: statusResponse,
        channel: 'whatsapp',
      });

      console.log(`✅ [${Date.now() - startTime}ms] Status response sent`);

      // Update conversation
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);

      const totalTime = Date.now() - startTime;
      console.log(`🎉 [${totalTime}ms] Status inquiry complete`);

      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    // 7. Send actual response to resident
    let responseMessage: string;

    if (!analysis.requiresHumanReview && analysis.suggestedResponse) {
      // Send AI's suggested response
      responseMessage = analysis.suggestedResponse;
      console.log(`⚡ [${Date.now() - startTime}ms] Sending AI auto-response`);
    } else {
      // Send acknowledgment for issues requiring human review
      responseMessage = resident.preferred_language === 'en'
        ? `Thank you for contacting us. Your ${analysis.intent === 'maintenance_request' ? 'maintenance request' : 'message'} has been received and forwarded to our team. We'll respond as soon as possible.`
        : `Gracias por contactarnos. Tu ${analysis.intent === 'maintenance_request' ? 'solicitud de mantenimiento' : 'mensaje'} ha sido recibida y enviada a nuestro equipo. Te responderemos lo antes posible.`;

      console.log(`⚡ [${Date.now() - startTime}ms] Sending final acknowledgment (requires human review)`);
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

    console.log(`✅ [${Date.now() - startTime}ms] Response sent to resident`);

    // 8. Route message to owner/admin if needed
    if (analysis.routeTo === 'owner' && resident.type === 'renter') {
      await routeToOwner(resident, building, messageData.body, supabase);
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation.id);

    const totalTime = Date.now() - startTime;
    console.log(`🎉 [${totalTime}ms] Blok processing complete`);
    console.log(`📊 Performance: User saw instant ack in ~500ms, full response in ${totalTime}ms`);

    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'application/xml' }
    });

  } catch (error) {
    console.error('❌ Blok error:', error);
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

// Generate embedding using OpenAI
async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    console.log('[Embedding] 🔧 Starting embedding generation...');
    console.log('[Embedding] 📝 Text to embed:', text.substring(0, 100));

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      console.warn('[Embedding] ⚠️ OPENAI_API_KEY not configured, falling back to keyword search');
      return null;
    }

    console.log('[Embedding] 🔑 OpenAI key found, making API call...');

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      }),
    });

    console.log('[Embedding] 📡 OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Embedding] ❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;
    console.log('[Embedding] ✅ Embedding generated successfully, dimensions:', embedding.length);

    return embedding;
  } catch (error) {
    console.error('[Embedding] ❌ Error generating embedding:', error);
    console.error('[Embedding] ❌ Error details:', JSON.stringify(error));
    return null;
  }
}

// Search knowledge base for relevant information using semantic search
async function searchKnowledgeBase(query: string, buildingId: string, supabase: any): Promise<any[]> {
  try {
    console.log('[KB Search] 🔍 Starting knowledge base search...');
    console.log('[KB Search] 📝 Query:', query);
    console.log('[KB Search] 🏢 Building ID:', buildingId);

    // Try semantic search first
    const embedding = await generateEmbedding(query);

    if (embedding) {
      console.log('[KB Search] 🎯 Using semantic search with embeddings');
      console.log('[KB Search] 📊 Embedding dimensions:', embedding.length);

      // Use the match_knowledge function for semantic search
      console.log('[KB Search] 🔧 Calling match_knowledge RPC function...');
      const { data: entries, error } = await supabase.rpc('match_knowledge', {
        query_embedding: embedding,
        match_threshold: 0.5, // Lowered from 0.7 to 0.5 (50% similarity)
        match_count: 5,
        filter_building_id: buildingId,
      });

      console.log('[KB Search] 📡 RPC response received');

      if (error) {
        console.error('[KB Search] ❌ Semantic search error:', error);
        console.error('[KB Search] ❌ Error details:', JSON.stringify(error));
      } else {
        console.log('[KB Search] 📦 Semantic search returned:', entries?.length || 0, 'entries');
        if (entries && entries.length > 0) {
          console.log('[KB Search] ✅ Semantic search successful!');
          console.log('[KB Search] 📄 Results with similarity scores:');
          entries.forEach((entry: any, idx: number) => {
            console.log(`[KB Search]   ${idx + 1}. [${(entry.similarity * 100).toFixed(1)}%] ${entry.question?.substring(0, 60)}`);
          });
          return entries;
        } else {
          console.log('[KB Search] ⚠️ Semantic search returned 0 results (threshold: 0.5)');
        }
      }
    } else {
      console.log('[KB Search] ⚠️ No embedding generated, skipping semantic search');
    }

    // Fallback to keyword search
    console.log('[KB Search] 🔍 Falling back to keyword search');
    console.log('[KB Search] 📝 Keyword query pattern:', `question.ilike.%${query}%`);

    const { data: entries, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('building_id', buildingId)
      .eq('active', true)
      .or(`question.ilike.%${query}%,answer.ilike.%${query}%,keywords.cs.{${query}}`)
      .order('priority', { ascending: false })
      .limit(5);

    console.log('[KB Search] 📡 Keyword search response received');

    if (error) {
      console.error('[KB Search] ❌ Keyword search error:', error);
      console.error('[KB Search] ❌ Error details:', JSON.stringify(error));
      return [];
    }

    console.log('[KB Search] 📦 Keyword search returned:', entries?.length || 0, 'entries');
    if (entries && entries.length > 0) {
      console.log('[KB Search] ✅ Keyword search successful!');
      console.log('[KB Search] 📄 First result:', entries[0].question?.substring(0, 50));
    }

    return entries || [];
  } catch (error) {
    console.error('[KB Search] ❌ Knowledge base search error:', error);
    console.error('[KB Search] ❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    return [];
  }
}

// AI Message Analysis using Claude
async function analyzeMessage(
  message: string,
  residentType: 'owner' | 'renter',
  language: 'es' | 'en' = 'es',
  buildingContext?: string,
  buildingId?: string,
  supabase?: any
): Promise<AIAnalysisResult> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!anthropicApiKey) {
    console.error('❌ ANTHROPIC_API_KEY not set');
    return getFallbackResponse(language);
  }

  // Search knowledge base for relevant information
  let knowledgeContext = '';
  let knowledgeEntries: any[] = [];

  if (buildingId && supabase) {
    console.log('[AI Analysis] 📚 Searching knowledge base...');
    knowledgeEntries = await searchKnowledgeBase(message, buildingId, supabase);

    if (knowledgeEntries.length > 0) {
      console.log(`[AI Analysis] ✅ Found ${knowledgeEntries.length} knowledge base entries`);
      console.log('[AI Analysis] 📄 Entries:', knowledgeEntries.map(e => e.question?.substring(0, 50)));
      knowledgeContext = `
BASE DE CONOCIMIENTO DEL EDIFICIO (Usa esta información para responder preguntas):
${knowledgeEntries.map((entry, idx) => `
${idx + 1}. Pregunta: ${entry.question}
   Respuesta: ${entry.answer}
   Categoría: ${entry.category}
`).join('\n')}
`;
      console.log('[AI Analysis] 📝 Knowledge context added to prompt (length:', knowledgeContext.length, 'chars)');
    } else {
      console.log('[AI Analysis] ⚠️ No knowledge base entries found');
    }
  } else {
    console.log('[AI Analysis] ⚠️ Skipping knowledge base search (buildingId or supabase missing)');
  }

  // 🚀 HAIKU 4.5 - Fast, cost-effective, similar quality to Sonnet for structured tasks
  // Performance: ~160-375ms (4-5x faster than Sonnet), 1/3 the cost
  // Perfect for real-time WhatsApp chat with structured JSON output
  const selectedModel = 'claude-haiku-4-5';

  console.log('[AI Analysis] ⚡ Using Claude Haiku 4.5 for instant response');
  console.log(`[AI Analysis] 💡 KB entries found: ${knowledgeEntries.length}`);

  const prompt = buildAIPrompt(message, residentType, language, buildingContext, knowledgeContext);

  try {
    console.log(`[AI Analysis] 🚀 Calling Anthropic API with model: ${selectedModel}`);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
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
      console.log(`🤖 AI analysis successful (model: ${selectedModel})`);
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
  buildingContext?: string,
  knowledgeContext?: string
): string {
  const isSpanish = language === 'es';

  return isSpanish ? `
Eres un asistente AI para Blok, un sistema de gestión de condominios en Puerto Rico.

CONTEXTO:
- Tipo de residente: ${residentType === 'owner' ? 'Propietario' : 'Inquilino'}
- Idioma: Español
- Edificio: ${buildingContext || 'N/A'}
${knowledgeContext || ''}

MENSAJE DEL RESIDENTE:
"${message}"

TAREA: Analiza este mensaje y responde en formato JSON con estos campos:

1. **intent**: Clasifica el mensaje como uno de:
   - maintenance_request (reparaciones, problemas en unidad o áreas comunes)
   - status_inquiry (preguntar por el estado de su solicitud/ticket/reporte)
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
   - **IMPORTANTE**: Si la BASE DE CONOCIMIENTO DEL EDIFICIO contiene información relevante, ÚSALA para responder la pregunta con precisión
   - Si es mantenimiento, confirma recepción y di que admin revisará
   - Si es pregunta que puedes responder con info de la base de conocimiento, provee esa respuesta específica
   - Si no sabes, di que admin responderá en 24 horas

5. **requiresHumanReview**: true si admin DEBE revisar (emergencias, quejas, problemas complejos)

6. **extractedData**: Extrae detalles relevantes (categoría, urgencia, ubicación, etc.)
   - Para solicitudes de mantenimiento, **maintenanceCategory** debe ser EXACTAMENTE uno de estos valores:
     * "plumber" - fugas de agua, tuberías, desagües, inodoros, lavamanos
     * "electrician" - problemas eléctricos, enchufes, breakers, luces
     * "handyman" - reparaciones generales, puertas, ventanas, arreglos menores
     * "ac_technician" - aire acondicionado, calefacción, HVAC
     * "washer_dryer_technician" - lavadoras, secadoras, electrodomésticos de lavandería
     * "painter" - pintura, reparación de paredes
     * "locksmith" - cerraduras, llaves, seguridad
     * "pest_control" - insectos, roedores, plagas
     * "cleaning" - limpieza profunda, limpieza de mudanza
     * "security" - sistemas de seguridad, cámaras
     * "landscaping" - jardines, plantas, mantenimiento exterior
     * "elevator" - problemas con ascensor
     * "pool_maintenance" - piscina, jacuzzi
     * "other" - si ninguna de las anteriores aplica
   - IMPORTANTE: Usa estos nombres EXACTOS de categorías (ej. "washer_dryer_technician" no "appliance" ni "lavadora")

RESPUESTA (solo JSON, sin markdown):
{
  "intent": "maintenance_request",
  "priority": "high",
  "routeTo": "admin",
  "suggestedResponse": "Hemos recibido tu solicitud de mantenimiento. Un miembro del equipo revisará esto dentro de 24 horas. ¡Gracias por reportarlo!",
  "requiresHumanReview": true,
  "extractedData": {
    "maintenanceCategory": "plumber",
    "urgency": "high",
    "location": "unit"
  }
}
` : `
You are an AI assistant for Blok, a Puerto Rico condominium management system.

CONTEXT:
- Resident type: ${residentType === 'owner' ? 'Owner' : 'Renter'}
- Language: English
- Building: ${buildingContext || 'N/A'}
${knowledgeContext || ''}

MESSAGE FROM RESIDENT:
"${message}"

TASK: Analyze this message and respond in JSON format with these fields:

1. **intent**: Classify as one of:
   - maintenance_request (repairs, issues in unit or common areas)
   - status_inquiry (asking about the status of their request/ticket/report)
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
   - **IMPORTANT**: If the BUILDING KNOWLEDGE BASE contains relevant information, USE IT to answer the question accurately
   - If maintenance, acknowledge and say admin will review
   - If question you can answer with knowledge base info, provide that specific answer
   - If you don't know, say admin will follow up within 24 hours

5. **requiresHumanReview**: true if admin MUST review (emergencies, complaints, complex issues)

6. **extractedData**: Extract relevant details (category, urgency, location, etc.)
   - For maintenance requests, **maintenanceCategory** must be EXACTLY one of these values:
     * "plumber" - water leaks, pipes, drains, toilets, sinks
     * "electrician" - electrical issues, outlets, breakers, lights
     * "handyman" - general repairs, doors, windows, minor fixes
     * "ac_technician" - air conditioning, heating, HVAC
     * "washer_dryer_technician" - washing machines, dryers, laundry appliances
     * "painter" - painting, wall repairs
     * "locksmith" - locks, keys, security
     * "pest_control" - insects, rodents, pests
     * "cleaning" - deep cleaning, move-out cleaning
     * "security" - security systems, cameras
     * "landscaping" - gardens, plants, outdoor maintenance
     * "elevator" - elevator issues
     * "pool_maintenance" - pool, hot tub
     * "other" - if none of the above fit
   - IMPORTANT: Use these EXACT category names (e.g., "washer_dryer_technician" not "appliance")

RESPONSE (JSON only, no markdown):
{
  "intent": "maintenance_request",
  "priority": "high",
  "routeTo": "admin",
  "suggestedResponse": "We received your maintenance request. A team member will review this within 24 hours. Thank you for reporting!",
  "requiresHumanReview": true,
  "extractedData": {
    "maintenanceCategory": "plumber",
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

// Fetch resident's maintenance requests
async function getResidentMaintenanceRequests(
  supabase: any,
  residentId: string,
  buildingId: string
): Promise<{ requests: any[]; total: number }> {
  try {
    // Get total count of active tickets
    const { count: totalCount } = await supabase
      .from('maintenance_requests')
      .select('id', { count: 'exact', head: true })
      .eq('building_id', buildingId)
      .eq('resident_id', residentId)
      .in('status', ['open', 'in_progress']);

    // Get tickets sorted by date first (we'll sort by priority in app)
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('id, title, description, category, priority, status, reported_at, resolved_at')
      .eq('building_id', buildingId)
      .eq('resident_id', residentId)
      .in('status', ['open', 'in_progress'])
      .order('reported_at', { ascending: false });

    if (error) {
      console.error('[Maintenance Requests] Error fetching:', error);
      return { requests: [], total: 0 };
    }

    // Sort by priority: emergency > high > medium > low, then by date
    const priorityOrder: Record<string, number> = {
      emergency: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const sortedData = (data || []).sort((a: any, b: any) => {
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      // If same priority, sort by date (most recent first)
      return new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime();
    });

    return {
      requests: sortedData.slice(0, 5), // Take top 5 after sorting
      total: totalCount || 0
    };
  } catch (error) {
    console.error('[Maintenance Requests] Error:', error);
    return { requests: [], total: 0 };
  }
}

// Format maintenance requests for WhatsApp response
function formatMaintenanceRequestsResponse(
  requests: any[],
  total: number,
  language: 'es' | 'en'
): string {
  if (requests.length === 0) {
    return language === 'es'
      ? 'No tienes solicitudes de mantenimiento activas en este momento.'
      : 'You have no active maintenance requests at this time.';
  }

  const statusLabels = {
    es: {
      open: 'Abierta',
      in_progress: 'En Progreso',
      resolved: 'Resuelta',
      closed: 'Cerrada',
    },
    en: {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
    },
  };

  const priorityLabels = {
    es: { emergency: '🚨 Emergencia', high: '⚠️ Alta', medium: '📌 Media', low: '📝 Baja' },
    en: { emergency: '🚨 Emergency', high: '⚠️ High', medium: '📌 Medium', low: '📝 Low' },
  };

  // Header shows count and if there are more
  const header = language === 'es'
    ? total > requests.length
      ? `📋 Mostrando ${requests.length} de ${total} solicitudes activas (más urgentes primero):\n\n`
      : `📋 Tienes ${requests.length} solicitud(es) activa(s):\n\n`
    : total > requests.length
      ? `📋 Showing ${requests.length} of ${total} active requests (most urgent first):\n\n`
      : `📋 You have ${requests.length} active request(s):\n\n`;

  const requestList = requests.map((req, idx) => {
    const status = statusLabels[language][req.status as keyof typeof statusLabels.es] || req.status;
    const priority = priorityLabels[language][req.priority as keyof typeof priorityLabels.es] || req.priority;
    const title = req.title || req.description.substring(0, 50);

    return language === 'es'
      ? `${idx + 1}. ${title}\n   Estado: ${status}\n   Prioridad: ${priority}\n   Reportado: ${new Date(req.reported_at).toLocaleDateString('es-PR')}`
      : `${idx + 1}. ${title}\n   Status: ${status}\n   Priority: ${priority}\n   Reported: ${new Date(req.reported_at).toLocaleDateString('en-US')}`;
  }).join('\n\n');

  // Footer with note if there are more tickets
  let footer = language === 'es'
    ? '\n\n💬 Para más información, contacta a la administración.'
    : '\n\n💬 For more information, contact the administration.';

  if (total > requests.length) {
    footer = language === 'es'
      ? `\n\n⚠️ Tienes ${total - requests.length} solicitud(es) adicional(es).\n💬 Contacta a la administración para ver todas.`
      : `\n\n⚠️ You have ${total - requests.length} additional request(s).\n💬 Contact administration to view all.`;
  }

  return header + requestList + footer;
}

// Download media from Twilio
async function downloadMediaFromTwilio(
  mediaUrl: string,
  accountSid: string,
  authToken: string
): Promise<Uint8Array> {
  try {
    console.log('[Media] 📥 Downloading from Twilio:', mediaUrl);

    const response = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Basic ${btoa(accountSid + ':' + authToken)}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download media: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    console.log('[Media] ✅ Downloaded successfully, size:', buffer.byteLength, 'bytes');
    return new Uint8Array(buffer);
  } catch (error) {
    console.error('[Media] ❌ Download failed:', error);
    throw error;
  }
}

// Upload media to Supabase Storage
async function uploadMediaToStorage(
  supabase: any,
  mediaData: Uint8Array,
  contentType: string,
  buildingId: string,
  messageSid: string
): Promise<{ url: string; path: string }> {
  try {
    console.log('[Media] ☁️ Uploading to Supabase Storage...');
    console.log('[Media] 📊 Content-Type:', contentType, 'Size:', mediaData.byteLength, 'bytes');

    // Generate unique filename with proper extension
    const extension = contentType.split('/')[1]?.split(';')[0] || 'bin';
    const timestamp = new Date().getTime();
    const storagePath = `${buildingId}/${timestamp}_${messageSid}.${extension}`;

    console.log('[Media] 📁 Storage path:', storagePath);

    const { data, error } = await supabase
      .storage
      .from('blok-media')
      .upload(storagePath, mediaData, {
        contentType: contentType,
        upsert: false
      });

    if (error) {
      console.error('[Media] ❌ Upload error:', error);
      throw error;
    }

    console.log('[Media] ✅ Upload successful');

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('blok-media')
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;
    console.log('[Media] 🔗 Public URL:', publicUrl);

    return {
      url: publicUrl,
      path: storagePath
    };
  } catch (error) {
    console.error('[Media] ❌ Storage upload failed:', error);
    throw error;
  }
}

// Send WhatsApp message via Twilio
async function sendWhatsAppMessage(
  to: string,
  from: string,
  message: string,
  mediaUrl?: string,
  retryCount = 0
): Promise<void> {
  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      throw new Error('Missing Twilio credentials');
    }

    // Build request parameters
    const params: Record<string, string> = {
      From: `whatsapp:${from}`,
      To: `whatsapp:${to}`,
      Body: message,
    };

    // Add media URL if provided
    if (mediaUrl) {
      params.MediaUrl = mediaUrl;
      console.log('📎 Sending message with media:', mediaUrl);
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(accountSid + ':' + authToken)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params),
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
