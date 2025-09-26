// Initialize Supabase client using config
const supabase = window.supabase.createClient(
  window.SUPABASE_CONFIG.url,
  window.SUPABASE_CONFIG.anonKey
);

// EmailJS Configuration for service request notifications
const EMAILJS_SERVICE_ID = 'service_h42snoe';
const EMAILJS_TEMPLATE_ID = 'template_bs44xai'; // Make sure this matches your actual template ID
const EMAILJS_USER_ID = 'JmK0NPfX384DZPdfN';

// Initialize EmailJS with debugging
console.log('Initializing EmailJS with User ID:', EMAILJS_USER_ID);
emailjs.init(EMAILJS_USER_ID);

// Global variables
let currentUser = null;
let userProfile = null;
let currentEditField = null;
let selectedServiceType = null;

// DOM Elements
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const modalTitle = document.getElementById('modal-title');
const modalLabel = document.getElementById('modal-label');
const modalInput = document.getElementById('modal-input');

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

// Enhanced email notification function with better debugging
async function sendServiceRequestNotification(serviceRequest) {
  console.log('🔄 Starting email notification process...');
  console.log('Service Request Data:', serviceRequest);
  
  try {
    // Check if EmailJS is available
    if (typeof emailjs === 'undefined') {
      console.error('❌ EmailJS not loaded!');
      showMessage('error', 'EmailJS not loaded. Please refresh the page.');
      return;
    }
    console.log('✅ EmailJS is available');

    // Validate userProfile exists
    if (!userProfile) {
      console.error('❌ User profile not loaded!');
      showMessage('error', 'User profile not loaded. Please refresh the page.');
      return;
    }
    console.log('✅ User profile available:', userProfile);

    // Prepare email template parameters
    const templateParams = {
      name: userProfile.point_of_contact || 'Customer',
      business_name: userProfile.business_name || 'Unknown Business',
      business_address: userProfile.business_address || 'Address not provided',
      service_name: serviceRequest.service_name || 'Unknown Service',
      service_type: serviceRequest.service_type || 'unknown',
      point_of_contact: userProfile.point_of_contact || 'Not specified',
      phone_number: userProfile.phone_number || 'Not provided',
      user_email: currentUser?.email || userProfile.email || 'No email',
      request_id: serviceRequest.id || 'temp-' + Date.now(),
      submission_date: new Date().toLocaleDateString(),
      submission_time: new Date().toLocaleTimeString(),
      admin_link: `${window.location.origin}/admin.html`
    };

    console.log('📧 Template parameters:', templateParams);
    console.log('📡 Sending email with config:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      userId: EMAILJS_USER_ID
    });

    // Send email using EmailJS with promise handling
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );

    console.log('✅ Email sent successfully:', result);
    showMessage('success', 'Service request submitted and notification sent!');
    return result;

  } catch (error) {
    console.error('❌ EmailJS Error Details:', error);
    console.error('Error status:', error.status);
    console.error('Error text:', error.text);
    
    // More specific error messages
    let errorMsg = 'Failed to send notification: ';
    if (error.status === 400) {
      errorMsg += 'Invalid template parameters or template not found';
    } else if (error.status === 401) {
      errorMsg += 'Authentication failed - check your EmailJS keys';
    } else if (error.status === 404) {
      errorMsg += 'Template or service not found';
    } else if (error.status === 429) {
      errorMsg += 'Rate limit exceeded';
    } else {
      errorMsg += error.text || error.message || 'Unknown error';
    }
    
    showMessage('error', errorMsg);
    throw error; // Re-throw so calling function knows it failed
  }
}

// Authentication functions
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showMessage('error', 'Error signing out: ' + error.message);
    } else {
      window.location.href = 'index.html';
    }
  } catch (error) {
    showMessage('error', 'An unexpected error occurred while signing out.');
  }
}

// Profile management functions
async function loadUserProfile() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      window.location.href = 'login.html';
      return;
    }

    currentUser = user;
    console.log('Current user loaded:', currentUser);

    // Load user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // No profile found, redirect to onboarding
        window.location.href = 'onboarding.html';
        return;
      } else {
        showMessage('error', 'Error loading profile: ' + profileError.message);
        return;
      }
    }

    userProfile = profile;
    console.log('User profile loaded:', userProfile);
    displayProfileData();
    loadServiceRequests();

  } catch (error) {
    showMessage('error', 'An unexpected error occurred while loading profile.');
    console.error('Load profile error:', error);
  }
}

function displayProfileData() {
  if (!userProfile) return;

  document.getElementById('business-name-display').textContent = userProfile.business_name || 'Not set';
  document.getElementById('business-address-display').textContent = userProfile.business_address || 'Not set';
  document.getElementById('point-of-contact-display').textContent = userProfile.point_of_contact || 'Not set';
  document.getElementById('phone-number-display').textContent = userProfile.phone_number || 'Not set';
  document.getElementById('office-size-display').textContent = userProfile.office_size ? `${userProfile.office_size} people` : 'Not set';
}

// Edit modal functions
function editField(fieldName) {
  currentEditField = fieldName;

  const fieldLabels = {
    'business-name': 'Business Name',
    'business-address': 'Business Address',
    'point-of-contact': 'Point of Contact',
    'phone-number': 'Phone Number',
    'office-size': 'Office Size (Number of People)'
  };

  const fieldValues = {
    'business-name': userProfile.business_name || '',
    'business-address': userProfile.business_address || '',
    'point-of-contact': userProfile.point_of_contact || '',
    'phone-number': userProfile.phone_number || '',
    'office-size': userProfile.office_size || ''
  };

  modalTitle.textContent = `Edit ${fieldLabels[fieldName]}`;
  modalLabel.textContent = fieldLabels[fieldName];
  modalInput.value = fieldValues[fieldName];

  // Set input type based on field
  if (fieldName === 'office-size') {
    modalInput.type = 'number';
    modalInput.min = '1';
  } else if (fieldName === 'phone-number') {
    modalInput.type = 'tel';
  } else {
    modalInput.type = 'text';
  }

  editModal.classList.remove('hidden');
  modalInput.focus();
}

function closeModal() {
  editModal.classList.add('hidden');
  currentEditField = null;
  editForm.reset();
}

// Edit form submission
if (editForm) {
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentEditField || !userProfile) return;

    const newValue = modalInput.value.trim();

    try {
      const updateData = {};
      updateData[currentEditField.replace('-', '_')] = newValue;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', currentUser.id);

      if (error) {
        showMessage('error', 'Failed to update profile: ' + error.message);
        return;
      }

      // Update local profile data
      userProfile[currentEditField.replace('-', '_')] = newValue;
      displayProfileData();

      showMessage('success', 'Profile updated successfully!');
      closeModal();

    } catch (error) {
      showMessage('error', 'An unexpected error occurred while updating profile.');
      console.error('Update profile error:', error);
    }
  });
}

// Service selection and submission functions
function selectService(serviceType) {
  selectedServiceType = serviceType;
  
  const serviceNames = {
    'coffee-refill': 'Coffee Refill',
    'nitrogen-refill': 'Nitrogen Refill',
    'kegerator-maintenance': 'Kegerator Maintenance'
  };
  
  // Update the selected service display
  document.getElementById('selected-service-name').textContent = serviceNames[serviceType];
  
  // Show the submit section
  document.getElementById('service-submit-section').style.display = 'block';
  
  // Remove active class from all cards and add to selected one
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => card.classList.remove('selected'));
  
  // Find and highlight the selected card
  const selectedCard = Array.from(serviceCards).find(card => 
    card.querySelector('h3').textContent === serviceNames[serviceType]
  );
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }
}

async function submitServiceRequest() {
  console.log('🚀 Starting service request submission...');
  
  if (!selectedServiceType) {
    showMessage('error', 'Please select a service first.');
    return;
  }
  
  if (!currentUser || !userProfile) {
    showMessage('error', 'Please ensure you are logged in and have completed your profile.');
    return;
  }

  const serviceNames = {
    'coffee-refill': 'Coffee Refill',
    'nitrogen-refill': 'Nitrogen Refill',
    'kegerator-maintenance': 'Kegerator Maintenance'
  };

  try {
    // First, create the service request in the database
    const { data, error } = await supabase
      .from('service_requests')
      .insert([
        {
          user_id: currentUser.id,
          business_name: userProfile.business_name,
          business_address: userProfile.business_address,
          service_type: selectedServiceType,
          service_name: serviceNames[selectedServiceType],
          status: 'pending',
          email: currentUser.email || userProfile.email,
          created_at: new Date().toISOString()
        }
      ])
      .select(); // Add select() to get the returned data

    if (error) {
      console.error('❌ Database error:', error);
      showMessage('error', 'Failed to create service request: ' + error.message);
      return;
    }

    console.log('✅ Service request created in database:', data);

    // Create service request data for email notification
    const serviceRequestData = {
      id: data && data[0] ? data[0].id : 'temp-' + Date.now(),
      business_name: userProfile.business_name,
      business_address: userProfile.business_address,
      service_type: selectedServiceType,
      service_name: serviceNames[selectedServiceType],
      status: 'pending',
      email: currentUser.email || userProfile.email,
      created_at: new Date().toISOString()
    };

    console.log('📧 Attempting to send email notification...');
    
    // Send email notification to team
    try {
      await sendServiceRequestNotification(serviceRequestData);
      showMessage('success', `${serviceNames[selectedServiceType]} request submitted and notification sent!`);
    } catch (emailError) {
      // Service request was created successfully, but email failed
      console.error('Email failed, but service request was created:', emailError);
      showMessage('success', `${serviceNames[selectedServiceType]} request submitted! (Note: Email notification may have failed)`);
    }
    
    // Reset the selection
    selectedServiceType = null;
    document.getElementById('service-submit-section').style.display = 'none';
    
    // Remove active class from all cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => card.classList.remove('selected'));
    
    loadServiceRequests(); // Refresh the requests list

  } catch (error) {
    console.error('❌ Unexpected error during service request submission:', error);
    showMessage('error', 'An unexpected error occurred while submitting service request.');
  }
}

async function loadServiceRequests() {
  if (!currentUser) return;

  try {
    const { data: requests, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading service requests:', error);
      return;
    }

    displayServiceRequests(requests || []);

  } catch (error) {
    console.error('Load service requests error:', error);
  }
}

function displayServiceRequests(requests) {
  const requestsList = document.getElementById('requests-list');

  if (!requests || requests.length === 0) {
    requestsList.innerHTML = '<div class="no-requests">No service requests yet. Make your first request above!</div>';
    return;
  }

  const requestsHtml = requests.map(request => {
    const date = new Date(request.created_at).toLocaleDateString();
    const statusClass = request.status === 'completed' ? 'completed' :
                       request.status === 'in-progress' ? 'in-progress' : 'pending';

    return `
      <div class="request-item ${statusClass}">
        <div class="request-header">
          <h4>${request.service_name}</h4>
          <span class="request-date">${date}</span>
        </div>
        <div class="request-status">
          <span class="status-badge ${statusClass}">${request.status}</span>
        </div>
      </div>
    `;
  }).join('');

  requestsList.innerHTML = requestsHtml;
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', loadUserProfile);

// Close modal when clicking outside
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) {
    closeModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !editModal.classList.contains('hidden')) {
    closeModal();
  }
});

// Test function to verify EmailJS setup (call from browser console)
window.testEmailJS = async function() {
  console.log('🧪 Testing EmailJS setup...');
  
  const testParams = {
    name: 'Test User',
    business_name: 'Test Business',
    business_address: '123 Test St',
    service_name: 'Coffee Refill',
    service_type: 'coffee-refill',
    point_of_contact: 'Test Contact',
    phone_number: '555-0123',
    user_email: 'test@example.com',
    request_id: 'test-123',
    submission_date: new Date().toLocaleDateString(),
    submission_time: new Date().toLocaleTimeString(),
    admin_link: `${window.location.origin}/admin.html`
  };
  
  try {
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      testParams,
      EMAILJS_USER_ID
    );
    console.log('✅ Test email sent successfully:', result);
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
};