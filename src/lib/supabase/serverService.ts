import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

export const createServiceClient = () => {
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_KEY is not defined');
  }
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is not defined');
  }
  return createClient(supabaseUrl, serviceKey);
}; 

