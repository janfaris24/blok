import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Generate embedding using OpenAI for knowledge base entry
 */
async function generateEmbedding(question: string, answer: string): Promise<number[] | null> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      console.warn('[Knowledge Base] OPENAI_API_KEY not configured - skipping embedding generation');
      return null;
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
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('[Knowledge Base] Error generating embedding:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, question, answer, keywords, priority } = body;

    // Validation
    if (!category || !question || !answer) {
      return NextResponse.json(
        { error: 'Category, question, and answer are required' },
        { status: 400 }
      );
    }

    // Get building
    const { data: building } = await supabase
      .from('buildings')
      .select('id')
      .eq('admin_user_id', user.id)
      .single();

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    // Generate embedding for semantic search
    const embedding = await generateEmbedding(question, answer);

    // Create knowledge base entry with embedding
    const { data: entry, error } = await supabase
      .from('knowledge_base')
      .insert({
        building_id: building.id,
        category,
        question,
        answer,
        keywords: keywords || [],
        priority: priority || 0,
        created_by: user.id,
        embedding: embedding,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating knowledge base entry:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: any) {
    console.error('Error in knowledge base create:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
