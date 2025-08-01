// Initialize Supabase client using config
const supabase = window.supabase.createClient(
  window.SUPABASE_CONFIG.url,
  window.SUPABASE_CONFIG.anonKey
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