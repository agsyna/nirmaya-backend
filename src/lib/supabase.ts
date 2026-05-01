import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseAdmin = () => {
  if (supabaseClient) return supabaseClient;

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new AppError(503, 'Supabase storage is not configured');
  }

  supabaseClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
  return supabaseClient;
};
