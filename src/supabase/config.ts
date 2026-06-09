import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any = null;
let isMock = true;

if (supabaseUrl && supabaseUrl !== 'https://your-project-id.supabase.co' && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isMock = localStorage.getItem('thayam_force_local_mode') === 'true';
    console.log("Supabase client initialized. isMock =", isMock);
  } catch (error) {
    console.error("Failed to initialize Supabase SDK:", error);
  }
} else {
  console.warn("No Supabase environment variables detected. Offline mock mode enabled.");
}

export { supabase, isMock };


