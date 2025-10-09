// Initialize Supabase client using config
const supabase = window.supabase.createClient(
  window.SUPABASE_CONFIG.url,
  window.SUPABASE_CONFIG.anonKey
);

// DOM Elements
const resetForm = document.getElementById('reset-password');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const resetPasswordForm = document.getElementById('reset-password-form');
const successForm = document.getElementById('success-form');
const errorForm = document.getElementById('error-form');
const errorDetails = document.getElementById('error-details');
const requestNewResetLink = document.getElementById('request-new-reset');

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

// Show/hide form sections
function showForm(formId) {
  // Hide all forms
  resetPasswordForm.classList.add('hidden');
  successForm.classList.add('hidden');
  errorForm.classList.add('hidden');
  
  // Show the specified form
  document.getElementById(formId).classList.remove('hidden');
}

// Extract tokens from URL hash
function getTokensFromURL() {
  const hash = window.location.hash.substring(1); // Remove the #
  const params = new URLSearchParams(hash);
  
  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    tokenType: params.get('token_type'),
    expiresAt: params.get('expires_at'),
    expiresIn: params.get('expires_in'),
    type: params.get('type')
  };
}

// Validate password requirements
function validatePassword(password, confirmPassword) {
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
}

// Set session from URL tokens
async function setSessionFromTokens(tokens) {
  try {
    if (!tokens.accessToken || tokens.type !== 'recovery') {
      throw new Error('Invalid or missing reset tokens');
    }

    // Set the session using the tokens from the URL
    const { data, error } = await supabase.auth.setSession({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error setting session:', error);
    throw error;
  }
}

// Update password
async function updatePassword(newPassword) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

// Request new password reset
async function requestNewPasswordReset(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
}

// Initialize the reset password page
async function initializeResetPage() {
  const tokens = getTokensFromURL();
  
  // Check if we have valid tokens
  if (!tokens.accessToken || tokens.type !== 'recovery') {
    showForm('error-form');
    errorDetails.textContent = 'Invalid or missing password reset link. Please request a new one.';
    return;
  }

  try {
    // Set the session from the tokens
    await setSessionFromTokens(tokens);
    showForm('reset-password-form');
  } catch (error) {
    console.error('Failed to initialize reset page:', error);
    showForm('error-form');
    errorDetails.textContent = 'This password reset link has expired or is invalid. Please request a new one.';
  }
}

// Handle form submission
if (resetForm) {
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(resetForm);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Validate passwords
    const validationError = validatePassword(password, confirmPassword);
    if (validationError) {
      showMessage('error', validationError);
      return;
    }
    
    try {
      // Update the password
      await updatePassword(password);
      
      // Show success state
      showForm('success-form');
      showMessage('success', 'Password updated successfully!');
      
    } catch (error) {
      console.error('Password update error:', error);
      showMessage('error', 'Failed to update password: ' + error.message);
    }
  });
}

// Handle request new reset link
if (requestNewResetLink) {
  requestNewResetLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = prompt('Please enter your email address to receive a new reset link:');
    if (!email) return;
    
    try {
      await requestNewPasswordReset(email);
      showMessage('success', 'Password reset link sent to your email!');
    } catch (error) {
      console.error('Request reset error:', error);
      showMessage('error', 'Failed to send reset link: ' + error.message);
    }
  });
}

// Add some custom styles for the reset password page
const style = document.createElement('style');
style.textContent = `
  .success-content, .error-content {
    text-align: center;
    padding: 20px;
  }
  
  .success-icon, .error-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }
  
  .success-message, .error-message {
    margin-bottom: 30px;
    color: #666;
    line-height: 1.6;
  }
  
  .form-help {
    display: block;
    margin-top: 5px;
    font-size: 12px;
    color: #666;
  }
  
  .auth-button {
    width: 100%;
    margin-bottom: 20px;
  }
`;
document.head.appendChild(style);

// Initialize the page when it loads
document.addEventListener('DOMContentLoaded', initializeResetPage);



