import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Generate embedding using OpenAI
 */
async function generateEmbedding(question: string, answer: string): Promise<number[] | null> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Combine question and answer for better semantic search
    const text = `${question}\n${answer}`;

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
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('[Backfill] Error generating embedding:', error);
    throw error;
  }
}

/**
 * Backfill embeddings for existing knowledge base entries
 * GET /api/knowledge/backfill-embeddings
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Backfill] Starting embedding backfill...');

    // Get all knowledge base entries without embeddings
    const { data: entries, error: fetchError } = await supabase
      .from('knowledge_base')
      .select('id, question, answer, building_id')
      .is('embedding', null);

    if (fetchError) {
      console.error('[Backfill] Error fetching entries:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        message: 'No entries need backfilling',
        updated: 0,
        total: 0
      });
    }

    console.log(`[Backfill] Found ${entries.length} entries without embeddings`);

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process each entry
    for (const entry of entries) {
      try {
        console.log(`[Backfill] Processing entry ${entry.id}...`);

        const embedding = await generateEmbedding(entry.question, entry.answer);

        if (!embedding) {
          throw new Error('Failed to generate embedding');
        }

        // Update the entry with the embedding
        const { error: updateError } = await supabase
          .from('knowledge_base')
          .update({ embedding })
          .eq('id', entry.id);

        if (updateError) {
          throw updateError;
        }

        updated++;
        console.log(`[Backfill] ✅ Updated entry ${entry.id}`);

        // Rate limiting: wait 100ms between requests to avoid hitting OpenAI rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        failed++;
        const errorMsg = `Entry ${entry.id}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`[Backfill] ❌ ${errorMsg}`);
      }
    }

    console.log(`[Backfill] Complete! Updated: ${updated}, Failed: ${failed}`);

    return NextResponse.json({
      message: 'Backfill complete',
      updated,
      failed,
      total: entries.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('[Backfill] Unexpected error:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
