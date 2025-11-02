import Anthropic from '@anthropic-ai/sdk';
import type { AIAnalysisResult, MessageIntent, Language, ResidentType } from '@/types/blok';
import { createClient } from '@/lib/supabase-server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Fetches ALL knowledge base entries for a building
 * Let Claude Haiku 4.5 intelligently decide which entries are relevant
 * This is simpler, faster, and more reliable than embeddings
 */
async function getAllKnowledgeBase(buildingId: string): Promise<any[]> {
  try {
    console.log(`[Knowledge Base] Fetching all entries for building ${buildingId}`);

    const supabase = await createClient();

    // Fetch all active knowledge base entries for this building
    // Order by priority to give Claude the most important info first
    const { data: entries, error } = await supabase
      .from('knowledge_base')
      .select('question, answer, category, priority')
      .eq('building_id', buildingId)
      .eq('active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Knowledge Base] Error fetching entries:', error);
      return [];
    }

    console.log(`[Knowledge Base] ✅ Found ${entries?.length || 0} total entries`);
    return entries || [];
  } catch (error) {
    console.error('[Knowledge Base] Fetch error:', error);
    return [];
  }
}

/**
 * Fetches board members for a building
 * Used by AI to answer questions about board members and their contact information
 */
async function getBoardMembers(buildingId: string): Promise<any[]> {
  try {
    console.log(`[Board Members] Fetching board members for building ${buildingId}`);

    const supabase = await createClient();

    const { data: members, error } = await supabase
      .from('board_members')
      .select('name, role, phone, email')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Board Members] Error fetching members:', error);
      return [];
    }

    console.log(`[Board Members] ✅ Found ${members?.length || 0} board members`);
    return members || [];
  } catch (error) {
    console.error('[Board Members] Fetch error:', error);
    return [];
  }
}

/**
 * Fetches the next upcoming asamblea for a building
 * Used by AI to answer questions about upcoming meetings
 */
async function getNextAsamblea(buildingId: string): Promise<any | null> {
  try {
    console.log(`[Asamblea] Fetching next asamblea for building ${buildingId}`);

    const supabase = await createClient();

    // Fetch next scheduled asamblea in the future
    const { data: nextMeeting, error } = await supabase
      .from('asambleas')
      .select('meeting_date, meeting_type, location, agenda, meeting_link')
      .eq('building_id', buildingId)
      .eq('status', 'scheduled')
      .gte('meeting_date', new Date().toISOString())
      .order('meeting_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Asamblea] Error fetching next asamblea:', error);
      return null;
    }

    if (nextMeeting) {
      console.log(`[Asamblea] ✅ Found next asamblea on ${nextMeeting.meeting_date}`);
    } else {
      console.log(`[Asamblea] No upcoming asamblea scheduled`);
    }

    return nextMeeting;
  } catch (error) {
    console.error('[Asamblea] Fetch error:', error);
    return null;
  }
}

/**
 * Analyzes a resident's message using Claude AI to determine intent, priority, routing, and generate a response
 *
 * @param message - The message text from the resident
 * @param residentType - Whether the resident is an 'owner' or 'renter'
 * @param language - The resident's preferred language ('es' or 'en')
 * @param buildingContext - Optional building name/context for better responses
 * @param buildingId - Building ID for knowledge base lookup
 * @returns AI analysis with intent, priority, routing, suggested response, and extracted data
 */
export async function analyzeMessage(
  message: string,
  residentType: ResidentType,
  language: Language = 'es',
  buildingContext?: string,
  buildingId?: string
): Promise<AIAnalysisResult> {
  // Fetch ALL knowledge base entries for this building
  // Let Claude intelligently decide which ones are relevant
  let knowledgeContext = '';
  if (buildingId) {
    const knowledgeEntries = await getAllKnowledgeBase(buildingId);

    if (knowledgeEntries.length > 0) {
      knowledgeContext = `
BUILDING KNOWLEDGE BASE (${knowledgeEntries.length} entries - use ONLY the relevant ones to answer questions):
${knowledgeEntries.map((entry, idx) => `
${idx + 1}. Q: ${entry.question}
   A: ${entry.answer}
   Category: ${entry.category}
   Priority: ${entry.priority || 'normal'}
`).join('\n')}

**IMPORTANT**: Only use knowledge base entries that are DIRECTLY relevant to the resident's question. Ignore irrelevant entries.
`;
    }
  }

  // Fetch next upcoming asamblea
  let asambleaContext = '';
  if (buildingId) {
    const nextAsamblea = await getNextAsamblea(buildingId);

    if (nextAsamblea) {
      const meetingDate = new Date(nextAsamblea.meeting_date);
      const formatted = meetingDate.toLocaleDateString(language === 'es' ? 'es-PR' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      if (language === 'es') {
        asambleaContext = `
PRÓXIMA ASAMBLEA PROGRAMADA:
- Fecha: ${formatted}
- Tipo: ${nextAsamblea.meeting_type === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'}
- Lugar: ${nextAsamblea.location}
${nextAsamblea.agenda?.length ? `- Agenda:\n${nextAsamblea.agenda.map((item: string, i: number) => `  ${i + 1}. ${item}`).join('\n')}` : ''}
${nextAsamblea.meeting_link ? `- Link virtual: ${nextAsamblea.meeting_link}` : ''}

**Si el residente pregunta sobre la asamblea, proporciona TODA esta información de forma clara y completa.**
`;
      } else {
        asambleaContext = `
NEXT SCHEDULED MEETING:
- Date: ${formatted}
- Type: ${nextAsamblea.meeting_type === 'ordinaria' ? 'Regular' : 'Special'}
- Location: ${nextAsamblea.location}
${nextAsamblea.agenda?.length ? `- Agenda:\n${nextAsamblea.agenda.map((item: string, i: number) => `  ${i + 1}. ${item}`).join('\n')}` : ''}
${nextAsamblea.meeting_link ? `- Virtual link: ${nextAsamblea.meeting_link}` : ''}

**If the resident asks about the meeting, provide ALL this information clearly and completely.**
`;
      }
    } else {
      // Explicitly tell the AI there's no meeting scheduled
      if (language === 'es') {
        asambleaContext = `
ASAMBLEAS:
No hay asambleas programadas en este momento.

**Si el residente pregunta sobre asambleas, informa que actualmente no hay ninguna programada.**
`;
      } else {
        asambleaContext = `
MEETINGS:
No meetings are currently scheduled.

**If the resident asks about meetings, inform them that none are currently scheduled.**
`;
      }
    }
  }

  // Fetch board members
  let boardMembersContext = '';
  if (buildingId) {
    const boardMembers = await getBoardMembers(buildingId);

    if (boardMembers.length > 0) {
      if (language === 'es') {
        boardMembersContext = `
MIEMBROS DE LA JUNTA DIRECTIVA:
${boardMembers.map((member) => `
- ${member.role}: ${member.name}${member.phone ? `\n  Teléfono: ${member.phone}` : ''}${member.email ? `\n  Email: ${member.email}` : ''}
`).join('')}

**Si el residente pregunta sobre la junta directiva o cómo contactar a un miembro, proporciona esta información.**
`;
      } else {
        boardMembersContext = `
BOARD MEMBERS:
${boardMembers.map((member) => `
- ${member.role}: ${member.name}${member.phone ? `\n  Phone: ${member.phone}` : ''}${member.email ? `\n  Email: ${member.email}` : ''}
`).join('')}

**If the resident asks about board members or how to contact them, provide this information.**
`;
      }
    }
  }

  const prompt = `
You are an AI assistant for Blok, a Puerto Rico condominium management system.

CONTEXT:
- Resident type: ${residentType}
- Language: ${language}
- Building: ${buildingContext || 'N/A'}
${knowledgeContext}
${asambleaContext}
${boardMembersContext}

MESSAGE FROM RESIDENT:
"${message}"

TASK: Analyze this message and provide a structured response in JSON format with these fields:

1. **intent**: Classify the message intent as one of:
   - maintenance_request (repairs, issues in unit or common areas)
   - general_question (HOA rules, amenities, hours, etc.)
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
   - 'both' = Both owner and renter should be notified

4. **suggestedResponse**: Write a helpful response in ${language === 'es' ? 'Spanish' : 'English'}.
   - Be professional, warm, and concise (2-3 sentences)
   - **CRITICAL**: If the BUILDING KNOWLEDGE BASE contains a direct answer to the resident's question:
     * ANSWER THE QUESTION using the KB information
     * DO NOT say "admin will review" or "we'll get back to you"
     * Provide the specific answer from the knowledge base
   - If it's a maintenance request, acknowledge and say admin will review
   - If you don't have KB info to answer, say admin will follow up within 24 hours

5. **requiresHumanReview**: Set this carefully based on these rules:
   - **FALSE** = Questions answered by knowledge base (pool hours, fees, trash schedule, etc.)
   - **FALSE** = Simple general questions you can answer
   - **TRUE** = Maintenance requests, emergencies, complaints, complex issues
   - **TRUE** = Questions NOT covered by knowledge base that need admin input

6. **priority**: Set appropriately:
   - **low/medium** = General questions answered by knowledge base
   - **high** = Maintenance issues, urgent requests
   - **emergency** = Fire, flood, security threats

7. **extractedData**: Extract relevant details (location, category, urgency, etc.)
   - For maintenance requests, **maintenanceCategory** must be one of these exact values:
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
   - IMPORTANT: Use these exact category names (e.g., "washer_dryer_technician" not "appliance")

RESPONSE FORMAT (JSON only, no markdown):
{
  "intent": "maintenance_request",
  "priority": "high",
  "routeTo": "admin",
  "suggestedResponse": "Hemos recibido tu solicitud de mantenimiento. Un miembro del equipo revisará esto dentro de 24 horas. ¡Gracias por reportarlo!",
  "requiresHumanReview": true,
  "extractedData": {
    "maintenanceCategory": "plumber",
    "urgency": "high",
    "location": "kitchen"
  }
}
`;

  try {
    console.log('[AI] Starting Claude Haiku 4.5 API call...');
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    console.log('[AI] Claude API call completed');

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let jsonText = content.text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText
        .replace(/^```(?:json)?\s*\n?/i, '')
        .replace(/\n?```\s*$/i, '');
    }

    console.log('[AI] Parsing JSON response...');
    const result: AIAnalysisResult = JSON.parse(jsonText);

    console.log('[AI Analysis]', {
      message: message.substring(0, 50),
      intent: result.intent,
      priority: result.priority,
      routeTo: result.routeTo,
      requiresHumanReview: result.requiresHumanReview,
    });

    return result;
  } catch (error) {
    console.error('[AI Analysis Error]', error);
    console.error('[AI Analysis Error Stack]', error instanceof Error ? error.stack : 'No stack trace');

    // Fallback response when AI fails
    return {
      intent: 'other',
      priority: 'medium',
      routeTo: 'admin',
      suggestedResponse:
        language === 'es'
          ? 'Hemos recibido tu mensaje. Un administrador te responderá pronto.'
          : 'We received your message. An administrator will respond soon.',
      requiresHumanReview: true,
    };
  }
}
