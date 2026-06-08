import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-supabase.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

let supabase: any = null;
let isMock = true;

if (
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_URL !== 'https://mock-supabase.supabase.co' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isMock = false;
    console.log("Supabase client initialized.");
  } catch (error) {
    console.warn("Failed to initialize Supabase SDK, falling back to local simulation:", error);
  }
} else {
  console.log("No custom VITE_SUPABASE_URL detected. Local BroadcastChannel emulation enabled.");
}

export { supabase, isMock };
