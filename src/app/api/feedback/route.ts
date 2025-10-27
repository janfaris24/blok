import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Save to feedback table
    const { error } = await supabase
      .from('feedback')
      .insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        building: data.building,
        unit: data.unit,
        clarity_rating: parseInt(data.clarity),
        usefulness_rating: parseInt(data.usefulness),
        nps_score: parseInt(data.likelihood),
        concerns: data.concerns,
        suggestions: data.suggestions,
        interested: data.interested,
        submitted_at: data.timestamp,
      }]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If user is interested in trying Blok, add to waitlist
    if (data.interested === 'yes' && data.email) {
      const { error: waitlistError } = await supabase
        .from('waitlist')
        .upsert({
          email: data.email,
          name: data.name,
          phone: data.phone,
          building: data.building,
          role: data.role,
          source: 'feedback_form',
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'email',
          ignoreDuplicates: true
        });

      if (waitlistError) {
        console.error('Waitlist error (non-critical):', waitlistError);
        // Don't fail the request - feedback was saved successfully
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}
