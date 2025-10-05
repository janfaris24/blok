/**
 * Setup Test Data for CondoSync POC
 *
 * This script populates the database with test data:
 * - 1 test building
 * - Test residents (owners and renters)
 * - Units with relationships
 *
 * Run: npx tsx scripts/setup-test-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('   Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTestData() {
  console.log('🚀 Setting up test data for CondoSync POC...\n');

  try {
    // 1. Create test building
    console.log('1️⃣ Creating test building...');
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .insert({
        name: 'Edificio Vista del Mar',
        address: 'Calle Marina #123',
        city: 'San Juan',
        total_units: 10,
        whatsapp_business_number: '+14155238886', // Twilio sandbox number
        subscription_plan: 'basic',
        subscription_status: 'active',
      })
      .select()
      .single();

    if (buildingError) throw buildingError;
    console.log(`   ✅ Building created: ${building.name} (ID: ${building.id})\n`);

    // 2. Create test owners
    console.log('2️⃣ Creating test owners...');
    const { data: owner1, error: owner1Error } = await supabase
      .from('residents')
      .insert({
        building_id: building.id,
        type: 'owner',
        first_name: 'Carlos',
        last_name: 'Rodríguez',
        email: 'carlos@example.com',
        phone: '+17871234567',
        whatsapp_number: '+17871234567',
        preferred_language: 'es',
        opted_in_whatsapp: true,
        opted_in_email: true,
      })
      .select()
      .single();

    if (owner1Error) throw owner1Error;
    console.log(`   ✅ Owner 1: ${owner1.first_name} ${owner1.last_name}`);

    const { data: owner2, error: owner2Error } = await supabase
      .from('residents')
      .insert({
        building_id: building.id,
        type: 'owner',
        first_name: 'María',
        last_name: 'González',
        email: 'maria@example.com',
        phone: '+17879876543',
        whatsapp_number: '+17879876543',
        preferred_language: 'es',
        opted_in_whatsapp: true,
        opted_in_email: true,
      })
      .select()
      .single();

    if (owner2Error) throw owner2Error;
    console.log(`   ✅ Owner 2: ${owner2.first_name} ${owner2.last_name}\n`);

    // 3. Create test renters
    console.log('3️⃣ Creating test renters...');
    const { data: renter1, error: renter1Error } = await supabase
      .from('residents')
      .insert({
        building_id: building.id,
        type: 'renter',
        first_name: 'Ana',
        last_name: 'Martínez',
        email: 'ana@example.com',
        phone: '+17875551234',
        whatsapp_number: '+17875551234',
        preferred_language: 'es',
        opted_in_whatsapp: true,
        opted_in_email: true,
      })
      .select()
      .single();

    if (renter1Error) throw renter1Error;
    console.log(`   ✅ Renter 1: ${renter1.first_name} ${renter1.last_name}\n`);

    // 4. Create units
    console.log('4️⃣ Creating units...');

    // Unit 301 - Owner occupied (Carlos)
    const { data: unit301, error: unit301Error } = await supabase
      .from('units')
      .insert({
        building_id: building.id,
        unit_number: '301',
        floor: 3,
        owner_id: owner1.id,
        is_rented: false,
      })
      .select()
      .single();

    if (unit301Error) throw unit301Error;
    console.log(`   ✅ Unit 301 - Owner: ${owner1.first_name} (owner-occupied)`);

    // Update owner1 with unit_id
    await supabase
      .from('residents')
      .update({ unit_id: unit301.id })
      .eq('id', owner1.id);

    // Unit 302 - Rented (Owner: María, Renter: Ana)
    const { data: unit302, error: unit302Error } = await supabase
      .from('units')
      .insert({
        building_id: building.id,
        unit_number: '302',
        floor: 3,
        owner_id: owner2.id,
        is_rented: true,
        current_renter_id: renter1.id,
      })
      .select()
      .single();

    if (unit302Error) throw unit302Error;
    console.log(`   ✅ Unit 302 - Owner: ${owner2.first_name}, Renter: ${renter1.first_name} (rented)\n`);

    // Update residents with unit_ids
    await supabase
      .from('residents')
      .update({ unit_id: unit302.id })
      .eq('id', owner2.id);

    await supabase
      .from('residents')
      .update({ unit_id: unit302.id })
      .eq('id', renter1.id);

    // 5. Summary
    console.log('✅ Test data setup complete!\n');
    console.log('📊 Summary:');
    console.log(`   - Building: ${building.name}`);
    console.log(`   - WhatsApp Number: ${building.whatsapp_business_number}`);
    console.log(`   - Units: 2 (301: owner-occupied, 302: rented)`);
    console.log(`   - Residents: 3 (2 owners, 1 renter)\n`);

    console.log('🧪 Test Scenarios:');
    console.log(`   1. Send WhatsApp from ${renter1.phone} (Ana - renter):`);
    console.log('      "Hola, el aire acondicionado no funciona"');
    console.log('      Expected: AI creates maintenance request, notifies owner María\n');
    console.log(`   2. Send WhatsApp from ${owner1.phone} (Carlos - owner):`);
    console.log('      "¿A qué hora cierra la piscina?"');
    console.log('      Expected: AI responds with general info\n');
    console.log(`   3. Test webhook: curl -X POST http://localhost:3000/api/webhooks/whatsapp`);
    console.log(`      -F "From=whatsapp:${renter1.phone}"`);
    console.log(`      -F "To=whatsapp:${building.whatsapp_business_number}"`);
    console.log(`      -F "Body=El elevador está roto"\n`);

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    process.exit(1);
  }
}

setupTestData();
