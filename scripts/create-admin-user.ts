import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🔐 Creating admin user...');

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@demo.com',
    password: 'demo123',
    email_confirm: true,
  });

  if (authError) {
    console.error('❌ Error creating auth user:', authError.message);
    return;
  }

  console.log('✅ Auth user created:', authData.user.id);

  // Update building with admin_user_id
  const { error: buildingError } = await supabase
    .from('buildings')
    .update({ admin_user_id: authData.user.id })
    .eq('name', 'Edificio Vista del Mar');

  if (buildingError) {
    console.error('❌ Error updating building:', buildingError.message);
    return;
  }

  console.log('✅ Building updated with admin user');
  console.log('\n🎉 Admin user created successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Email: admin@demo.com');
  console.log('   Password: demo123');
  console.log('\n🚀 Start the dev server: npm run dev');
  console.log('   Then visit: http://localhost:3000');
}

createAdminUser();
