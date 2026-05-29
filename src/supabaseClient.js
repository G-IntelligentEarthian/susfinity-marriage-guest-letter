/*
  Replace these with your Supabase project values.
  Keep anon key public; never expose service role key in frontend.
*/
const SUPABASE_URL = "https://kfmubljxxabpokmbpniz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmbXVibGp4eGFicG9rbWJwbml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODc3NjksImV4cCI6MjA5NTU2Mzc2OX0.6sNcz9AxbphTD4nVf2fWKWep5xknSyEEJ019KQnWhIc";

const isConfigured =
  SUPABASE_URL !== "https://YOUR_PROJECT_ID.supabase.co" &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";

window.supabaseClient = isConfigured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
window.supabaseConfigured = isConfigured;
