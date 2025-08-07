import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uhqulnbkkfrsxkgxeipi.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmJra2Zyc3hrZ3hlaXBpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM0MDY2MCwiZXhwIjoyMDY4OTE2NjYwfQ.3WyVurCK7uSNtXzZkrZYhI64Ta5oXJuEiUna2sMQPrE';

export const createServiceClient = () => {
  return createClient(supabaseUrl, serviceKey);
}; 

