import Anthropic from '@anthropic-ai/sdk';
import type { AIAnalysisResult, MessageIntent, Language, ResidentType } from '@/types/blok';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyzes a resident's message using Claude AI to determine intent, priority, routing, and generate a response
 *
 * @param message - The message text from the resident
 * @param residentType - Whether the resident is an 'owner' or 'renter'
 * @param language - The resident's preferred language ('es' or 'en')
 * @param buildingContext - Optional building name/context for better responses
 * @returns AI analysis with intent, priority, routing, suggested response, and extracted data
 */
export async function analyzeMessage(
  message: string,
  residentType: ResidentType,
  language: Language = 'es',
  buildingContext?: string
): Promise<AIAnalysisResult> {
  const prompt = `
You are an AI assistant for CondoSync, a Puerto Rico condominium management system.

CONTEXT:
- Resident type: ${residentType}
- Language: ${language}
- Building: ${buildingContext || 'N/A'}

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
   - If it's a maintenance request, acknowledge and say admin will review
   - If it's a question you can answer, provide the answer
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
