import Anthropic from '@anthropic-ai/sdk';
import type { AIAnalysisResult, MessageIntent, Language, ResidentType } from '@/types/blok';
import { createClient } from '@/lib/supabase-server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate embedding for text using OpenAI
 * Uses text-embedding-3-small (1536 dimensions, $0.02 per 1M tokens)
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      console.warn('[Embeddings] OPENAI_API_KEY not configured, falling back to keyword search');
      return null;
    }

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

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('[Embeddings] Error generating embedding:', error);
    return null;
  }
}

/**
 * Searches the knowledge base for relevant information using semantic search
 * Falls back to keyword search if embeddings are not available
 */
async function searchKnowledgeBase(query: string, buildingId: string): Promise<any[]> {
  try {
    console.log(`[Knowledge Base] Searching for: "${query}" in building ${buildingId}`);

    const supabase = await createClient();

    // Try semantic search first
    const embedding = await generateEmbedding(query);

    if (embedding) {
      console.log('[Knowledge Base] Using semantic search with embeddings');

      // Use the match_knowledge function for semantic search
      const { data: entries, error } = await supabase.rpc('match_knowledge', {
        query_embedding: embedding,
        match_threshold: 0.5, // 50% similarity threshold (lowered for better recall)
        match_count: 5,
        filter_building_id: buildingId,
      });

      if (error) {
        console.error('[Knowledge Base] Semantic search error:', error);
        // Fall back to keyword search below
      } else {
        console.log(`[Knowledge Base] Found ${entries?.length || 0} entries (semantic)`);
        if (entries && entries.length > 0) {
          return entries;
        }
      }
    }

    // Fallback to keyword search if semantic search failed or returned no results
    console.log('[Knowledge Base] Falling back to keyword search');
    const { data: entries, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('building_id', buildingId)
      .eq('active', true)
      .or(`question.ilike.%${query}%,answer.ilike.%${query}%,keywords.cs.{${query}}`)
      .order('priority', { ascending: false })
      .limit(5);

    if (error) {
      console.error('[Knowledge Base] Keyword search error:', error);
      return [];
    }

    console.log(`[Knowledge Base] Found ${entries?.length || 0} entries (keyword)`);
    return entries || [];
  } catch (error) {
    console.error('[Knowledge Base] Search error:', error);
    return [];
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
  // Search knowledge base for relevant information
  let knowledgeContext = '';
  if (buildingId) {
    const knowledgeEntries = await searchKnowledgeBase(message, buildingId);

    if (knowledgeEntries.length > 0) {
      knowledgeContext = `
BUILDING KNOWLEDGE BASE (Use this information to answer questions):
${knowledgeEntries.map((entry, idx) => `
${idx + 1}. Q: ${entry.question}
   A: ${entry.answer}
   Category: ${entry.category}
`).join('\n')}
`;
    }
  }

  const prompt = `
You are an AI assistant for Blok, a Puerto Rico condominium management system.

CONTEXT:
- Resident type: ${residentType}
- Language: ${language}
- Building: ${buildingContext || 'N/A'}
${knowledgeContext}

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
   - **IMPORTANT**: If the BUILDING KNOWLEDGE BASE contains relevant information, USE IT to answer the question accurately
   - If it's a maintenance request, acknowledge and say admin will review
   - If it's a question you can answer with knowledge base info, provide that specific answer
   - If you don't know, say admin will follow up within 24 hours

5. **requiresHumanReview**: true if admin MUST review (emergencies, complaints, complex issues)

6. **extractedData**: Extract relevant details (location, category, urgency, etc.)

RESPONSE FORMAT (JSON only, no markdown):
{
  "intent": "maintenance_request",
  "priority": "high",
  "routeTo": "admin",
  "suggestedResponse": "Hemos recibido tu solicitud de mantenimiento. Un miembro del equipo revisará esto dentro de 24 horas. ¡Gracias por reportarlo!",
  "requiresHumanReview": true,
  "extractedData": {
    "maintenanceCategory": "plumbing",
    "urgency": "high",
    "location": "kitchen"
  }
}
`;

  try {
    console.log('[AI] Starting Claude API call...');
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
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
