// Supabase Configuration
// Update these values with your actual Supabase credentials
const SUPABASE_URL = 'https://ezfonjkotwmwdfbmcurr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Zm9uamtvdHdtd2RmYm1jdXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4Mjk0MDksImV4cCI6MjA2OTQwNTQwOX0.Q8H_YGVvsR1RCDLI_D3zspFHlw73z7Phh8HqVlqpfD0';

// Export for use in other files
window.SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY
}; 