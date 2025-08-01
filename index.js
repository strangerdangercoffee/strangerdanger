// Initialize Supabase client using config
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Check authentication status and update navigation
async function checkAuthStatus() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    const authBtn = document.getElementById('auth-btn');
    
    if (user && !error) {
      // User is logged in, show Dashboard link
      authBtn.textContent = 'DASHBOARD';
      authBtn.href = 'dashboard.html';
    } else {
      // User is not logged in, show Login link
      authBtn.textContent = 'LOG IN';
      authBtn.href = 'login.html';
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    // Default to login if there's an error
    const authBtn = document.getElementById('auth-btn');
    authBtn.textContent = 'LOG IN';
    authBtn.href = 'login.html';
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', checkAuthStatus); 