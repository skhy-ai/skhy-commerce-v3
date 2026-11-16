import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// SEC-23: Fail fast in production if env vars are missing.
// In dev, a console warning keeps DX smooth; in prod, a silent broken connection is worse than an early crash.
if (!supabaseUrl || !supabaseAnonKey) {
  const msg = 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.';
  if (import.meta.env.PROD) {
    throw new Error(msg);
  } else {
    console.warn(msg, 'Supabase features will not work in this environment.');
  }
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key'
);