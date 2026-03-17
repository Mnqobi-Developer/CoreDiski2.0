const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseBaseUrl = (supabaseUrl || '').replace(/\/$/, '');

export const supabaseHeaders = {
  apikey: supabaseAnonKey || '',
  Authorization: `Bearer ${supabaseAnonKey || ''}`,
  'Content-Type': 'application/json',
};
