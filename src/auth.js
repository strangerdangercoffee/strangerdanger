// Initialize Supabase client using config
const supabase = window.supabase.createClient(
  window.SUPABASE_CONFIG.url,
  window.SUPABASE_CONFIG.anonKey
);

// DOM Elements
const signinForm = document.getElementById('signin');
const signupForm = document.getElementById('signup');
const forgotPasswordForm = document.getElementById('forgot-password');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');

// Form switching function
function showForm(formType) {
  // Hide all forms
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.add('hidden');
  });
  
  // Show the selected form
  document.getElementById(`${formType}-form`).classList.remove('hidden');
  
  // Clear messages
  hideMessages();
}

// Make showForm available globally for onclick handlers
window.showForm = showForm;

// Message handling functions
function showMessage(type, message) {
  hideMessages();
  const messageElement = type === 'success' ? successMessage : errorMessage;
  messageElement.textContent = message;
  messageElement.classList.remove('hidden');
  
  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      messageElement.classList.add('hidden');
    }, 5000);
  }
}

function hideMessages() {
  successMessage.classList.add('hidden');
  errorMessage.classList.add('hidden');
}

// Sign In Form Handler
if (signinForm) {
  signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        showMessage('error', error.message);
      } else {
        showMessage('success', 'Successfully signed in!');
        
        // Check if user has completed onboarding
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            // Error other than "no rows returned"
            console.error('Error checking profile status:', profileError);
            // Redirect to dashboard as fallback
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 2000);
            return;
          }
          
          if (profile) {
            // User has completed onboarding, redirect to dashboard
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 2000);
          } else {
            // User hasn't completed onboarding, redirect to onboarding
            setTimeout(() => {
              window.location.href = 'onboarding.html';
            }, 2000);
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          // If there's an error, redirect to dashboard as fallback
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 2000);
        }
      }
    } catch (error) {
      showMessage('error', 'An unexpected error occurred. Please try again.');
    }
  });
}

// Sign Up Form Handler
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long');
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      
      if (error) {
        showMessage('error', error.message);
                   } else {
               showMessage('success', 'Account created successfully! Redirecting to onboarding...');
               // Clear form
               signupForm.reset();
               // Redirect to onboarding
               setTimeout(() => {
                 window.location.href = 'onboarding.html';
               }, 2000);
             }
    } catch (error) {
      showMessage('error', 'An unexpected error occurred. Please try again.');
    }
  });
}

// Forgot Password Form Handler
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password.html'
      });
      
      if (error) {
        showMessage('error', error.message);
      } else {
        showMessage('success', 'Password reset link sent to your email!');
        // Clear form
        forgotPasswordForm.reset();
        // Switch back to signin form
        setTimeout(() => {
          showForm('signin');
        }, 3000);
      }
    } catch (error) {
      showMessage('error', 'An unexpected error occurred. Please try again.');
    }
  });
}

// Check if user is already signed in
async function checkAuthStatus() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // User is already signed in, check if they have completed onboarding
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        // Error other than "no rows returned"
        console.error('Error checking profile status:', profileError);
        return;
      }
      
      if (profile) {
        // User has completed onboarding, redirect to dashboard
        window.location.href = 'dashboard.html';
      } else {
        // User hasn't completed onboarding, redirect to onboarding
        window.location.href = 'onboarding.html';
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      // If there's an error, redirect to dashboard as fallback
      window.location.href = 'dashboard.html';
    }
  }
}

// Initialize auth status check when page loads
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
}); 