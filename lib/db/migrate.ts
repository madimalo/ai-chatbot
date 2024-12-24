import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({
  path: '.env.local',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const runMigrate = async () => {
  console.log('⏳ Running migrations...');
  const start = Date.now();

  try {
    // Create tables if they don't exist
    await supabase.rpc('init_schema');
    
    const end = Date.now();
    console.log('✅ Migrations completed in', end - start, 'ms');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed');
    console.error(error);
    process.exit(1);
  }
};

runMigrate();
