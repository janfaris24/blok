/**
 * Test AI Message Analysis
 *
 * Run: npx tsx scripts/test-ai.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { analyzeMessage } from '../lib/condosync-ai';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ Error: ANTHROPIC_API_KEY not set in .env.local');
  process.exit(1);
}

const testMessages = [
  {
    message: 'Hola, el aire acondicionado no funciona. Hace mucho calor aquí.',
    type: 'renter' as const,
    language: 'es' as const,
  },
  {
    message: '¿A qué hora cierra la piscina?',
    type: 'owner' as const,
    language: 'es' as const,
  },
  {
    message: 'Hay mucho ruido en el apartamento de arriba a las 2am',
    type: 'owner' as const,
    language: 'es' as const,
  },
  {
    message: 'The elevator is broken and I need to get to my apartment',
    type: 'renter' as const,
    language: 'en' as const,
  },
];

async function testAI() {
  console.log('🤖 Testing AI Message Analysis\n');

  for (const test of testMessages) {
    console.log('📨 Message:', test.message);
    console.log('   Type:', test.type);
    console.log('   Language:', test.language);

    try {
      const analysis = await analyzeMessage(
        test.message,
        test.type,
        test.language,
        'Edificio Vista del Mar'
      );

      console.log('   ✅ Analysis:');
      console.log('      Intent:', analysis.intent);
      console.log('      Priority:', analysis.priority);
      console.log('      Route To:', analysis.routeTo);
      console.log('      Requires Human Review:', analysis.requiresHumanReview);
      console.log('      Suggested Response:', analysis.suggestedResponse);
      if (analysis.extractedData) {
        console.log('      Extracted Data:', JSON.stringify(analysis.extractedData, null, 2));
      }
      console.log('');
    } catch (error) {
      console.error('   ❌ Error:', error);
      console.log('');
    }
  }
}

testAI();
