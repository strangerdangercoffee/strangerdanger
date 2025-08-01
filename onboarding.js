// Initialize Supabase client using config
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// EmailJS Configuration (you'll need to set this up)
// Replace with your actual EmailJS service ID and template ID
const EMAILJS_SERVICE_ID = 'service_l9vlwek';
const EMAILJS_TEMPLATE_ID = 'template_50zp6p3';
const EMAILJS_USER_ID = 'JmK0NPfX384DZPdfN';

// Initialize EmailJS (uncomment after setting up EmailJS)
emailjs.init(EMAILJS_USER_ID);

// DOM Elements
const onboardingForm = document.getElementById('onboarding-form');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');

// Message handling functions
function showMessage(type, message) {
  hideMessages();
  const messageElement = type === 'success' ? successMessage : errorMessage;
  messageElement.textContent = message;
  messageElement.classList.remove('hidden');
}

function hideMessages() {
  successMessage.classList.add('hidden');
  errorMessage.classList.add('hidden');
}

// Email notification function
async function sendTeamNotification(userData, profileData) {
  try {
    // Check if EmailJS is available
    if (typeof emailjs === 'undefined') {
      console.warn('EmailJS not loaded. Skipping email notification.');
      return;
    }

    // Prepare email template parameters
    const templateParams = {
      to_email: 'team@strangerdangercoffee.com',
      to_name: 'Stranger Danger Coffee Team',
      from_name: profileData.point_of_contact,
      from_email: userData.email,
      business_name: profileData.business_name,
      business_address: profileData.business_address,
      office_size: profileData.office_size,
      point_of_contact: profileData.point_of_contact,
      phone_number: profileData.phone_number,
      user_email: userData.email,
      submission_date: new Date().toLocaleDateString(),
      submission_time: new Date().toLocaleTimeString()
    };

    // Send email using EmailJS
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );

    console.log('Team notification email sent successfully');
  } catch (error) {
    console.error('Failed to send team notification email:', error);
    // Don't throw error - we don't want to fail the onboarding if email fails
  }
}

// Onboarding Form Handler
if (onboardingForm) {
  onboardingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      showMessage('error', 'You must be logged in to complete onboarding. Please sign in first.');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 3000);
      return;
    }
    
    // Get form data
    const formData = new FormData(onboardingForm);
    const businessName = formData.get('businessName');
    const businessAddress = formData.get('businessAddress');
    const officeSize = parseInt(formData.get('officeSize'));
    const pointOfContact = formData.get('pointOfContact');
    const phoneNumber = formData.get('phoneNumber');
    
    try {
      // Insert profile data into Supabase
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: user.id,
            email: user.email,
            business_name: businessName,
            business_address: businessAddress,
            office_size: officeSize,
            point_of_contact: pointOfContact,
            phone_number: phoneNumber,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (error) {
        // Check if it's a duplicate key error (user already has a profile)
        if (error.code === '23505') {
          // Update existing profile instead
          const { data: updateData, error: updateError } = await supabase
            .from('profiles')
            .update({
              business_name: businessName,
              business_address: businessAddress,
              office_size: officeSize,
              point_of_contact: pointOfContact,
              phone_number: phoneNumber,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
          
          if (updateError) {
            showMessage('error', 'Failed to update profile: ' + updateError.message);
            return;
          }
        } else {
          showMessage('error', 'Failed to create profile: ' + error.message);
          return;
        }
      }
      
      // Send team notification email
      const profileData = {
        business_name: businessName,
        business_address: businessAddress,
        office_size: officeSize,
        point_of_contact: pointOfContact,
        phone_number: phoneNumber
      };
      
      await sendTeamNotification(user, profileData);
      
      showMessage('success', 'Profile setup completed successfully! Redirecting to dashboard...');
      
      // Redirect to dashboard after successful completion
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
      
    } catch (error) {
      showMessage('error', 'An unexpected error occurred. Please try again.');
      console.error('Onboarding error:', error);
    }
  });
}

// Check if user is authenticated and has already completed onboarding
async function checkOnboardingStatus() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    // User is not authenticated, redirect to login
    window.location.href = 'login.html';
    return;
  }
  
  // Check if user already has a profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (profileError && profileError.code !== 'PGRST116') {
    // Error other than "no rows returned"
    showMessage('error', 'Error checking profile status. Please try again.');
    return;
  }
  
  if (profile) {
    // User already has a profile, redirect to dashboard
    window.location.href = 'dashboard.html';
  }
}

// Initialize onboarding status check when page loads
document.addEventListener('DOMContentLoaded', checkOnboardingStatus); 