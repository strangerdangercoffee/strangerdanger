// Initialize Supabase client
const supabase = window.supabase.createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Global variables
let allRequests = [];
let allBusinesses = [];
let currentEditRequest = null;

// DOM Elements
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const statusModal = document.getElementById('status-modal');
const statusForm = document.getElementById('status-form');
const statusSelect = document.getElementById('status-select');
const statusNotes = document.getElementById('status-notes');

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

// Check if user is admin (you can modify this logic as needed)
async function checkAdminAccess() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      window.location.href = 'login.html';
      return;
    }

    // For now, we'll allow access to anyone who is logged in
    // You can add specific admin logic here later
    console.log('Admin access granted for user:', user.email);

  } catch (error) {
    showMessage('error', 'Error checking admin access.');
    console.error('Admin access check error:', error);
  }
}

// Load all service requests
async function loadAllRequests() {
  try {
    const { data: requests, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showMessage('error', 'Error loading requests: ' + error.message);
      return;
    }

    allRequests = requests || [];
    displayRequests(allRequests);
    updateStats(allRequests);
    populateBusinessFilter(allRequests);

  } catch (error) {
    showMessage('error', 'An unexpected error occurred while loading requests.');
    console.error('Load requests error:', error);
  }
}

// Load all business profiles
async function loadAllBusinesses() {
  try {
    const { data: businesses, error } = await supabase
      .from('profiles')
      .select('*')
      .order('business_name', { ascending: true });

    if (error) {
      console.error('Error loading businesses:', error);
      return;
    }

    allBusinesses = businesses || [];
    displayBusinesses(allBusinesses);

  } catch (error) {
    console.error('Load businesses error:', error);
  }
}

// Display requests in table
function displayRequests(requests) {
  const tbody = document.getElementById('requests-tbody');

  if (!requests || requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="no-data">No service requests found.</td></tr>';
    return;
  }

  const requestsHtml = requests.map(request => {
    const date = new Date(request.created_at).toLocaleDateString();
    const statusClass = request.status === 'completed' ? 'completed' :
                       request.status === 'in-progress' ? 'in-progress' : 'pending';

    return `
      <tr class="request-row ${statusClass}">
        <td>${date}</td>
        <td>${request.business_name || 'N/A'}</td>
        <td>${request.service_name || 'N/A'}</td>
        <td>
          <span class="status-badge ${statusClass}">${request.status}</span>
        </td>
        <td>
          <button class="action-btn" onclick="openStatusModal('${request.id}', '${request.status}')">
            Update Status
          </button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = requestsHtml;
}

// Display businesses in grid
function displayBusinesses(businesses) {
  const grid = document.getElementById('businesses-grid');

  if (!businesses || businesses.length === 0) {
    grid.innerHTML = '<div class="no-data">No business profiles found.</div>';
    return;
  }

  const businessesHtml = businesses.map(business => {
    return `
      <div class="business-card">
        <h3>${business.business_name || 'Unnamed Business'}</h3>
        <div class="business-info">
          <p><strong>Address:</strong> ${business.business_address || 'Not provided'}</p>
          <p><strong>Contact:</strong> ${business.point_of_contact || 'Not provided'}</p>
          <p><strong>Phone:</strong> ${business.phone_number || 'Not provided'}</p>
          <p><strong>Office Size:</strong> ${business.office_size ? `${business.office_size} people` : 'Not provided'}</p>
          <p><strong>Email:</strong> ${business.email || 'Not provided'}</p>
        </div>
      </div>
    `;
  }).join('');

  grid.innerHTML = businessesHtml;
}

// Update statistics
function updateStats(requests) {
  const total = requests.length;
  const pending = requests.filter(r => r.status === 'pending').length;
  const inProgress = requests.filter(r => r.status === 'in-progress').length;
  const completed = requests.filter(r => r.status === 'completed').length;

  document.getElementById('total-requests').textContent = total;
  document.getElementById('pending-requests').textContent = pending;
  document.getElementById('in-progress-requests').textContent = inProgress;
  document.getElementById('completed-requests').textContent = completed;
}

// Populate business filter dropdown
function populateBusinessFilter(requests) {
  const businessFilter = document.getElementById('business-filter');
  const businesses = [...new Set(requests.map(r => r.business_name).filter(name => name))];
  
  // Clear existing options except the first one
  businessFilter.innerHTML = '<option value="">All Businesses</option>';
  
  businesses.forEach(business => {
    const option = document.createElement('option');
    option.value = business;
    option.textContent = business;
    businessFilter.appendChild(option);
  });
}

// Filter requests based on selected filters
function filterRequests() {
  const businessFilter = document.getElementById('business-filter').value;
  const statusFilter = document.getElementById('status-filter').value;
  const serviceFilter = document.getElementById('service-filter').value;

  let filteredRequests = allRequests;

  if (businessFilter) {
    filteredRequests = filteredRequests.filter(r => r.business_name === businessFilter);
  }

  if (statusFilter) {
    filteredRequests = filteredRequests.filter(r => r.status === statusFilter);
  }

  if (serviceFilter) {
    filteredRequests = filteredRequests.filter(r => r.service_type === serviceFilter);
  }

  displayRequests(filteredRequests);
  updateStats(filteredRequests);
}

// Status modal functions
function openStatusModal(requestId, currentStatus) {
  currentEditRequest = requestId;
  statusSelect.value = currentStatus;
  statusNotes.value = '';
  
  const request = allRequests.find(r => r.id === requestId);
  if (request) {
    document.getElementById('status-modal-title').textContent = 
      `Update Status - ${request.business_name} - ${request.service_name}`;
  }

  statusModal.classList.remove('hidden');
  statusSelect.focus();
}

function closeStatusModal() {
  statusModal.classList.add('hidden');
  currentEditRequest = null;
  statusForm.reset();
}

// Status form submission
if (statusForm) {
  statusForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentEditRequest) return;

    const newStatus = statusSelect.value;
    const notes = statusNotes.value.trim();

    try {
      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Add notes if provided
      if (notes) {
        updateData.admin_notes = notes;
      }

      const { data, error } = await supabase
        .from('service_requests')
        .update(updateData)
        .eq('id', currentEditRequest);

      if (error) {
        showMessage('error', 'Failed to update status: ' + error.message);
        return;
      }

      // Update local data
      const requestIndex = allRequests.findIndex(r => r.id === currentEditRequest);
      if (requestIndex !== -1) {
        allRequests[requestIndex].status = newStatus;
        if (notes) {
          allRequests[requestIndex].admin_notes = notes;
        }
        allRequests[requestIndex].updated_at = updateData.updated_at;
      }

      // Refresh display
      displayRequests(allRequests);
      updateStats(allRequests);

      showMessage('success', 'Request status updated successfully!');
      closeStatusModal();

    } catch (error) {
      showMessage('error', 'An unexpected error occurred while updating status.');
      console.error('Update status error:', error);
    }
  });
}

// Initialize admin dashboard when page loads
document.addEventListener('DOMContentLoaded', async () => {
  await checkAdminAccess();
  await loadAllRequests();
  await loadAllBusinesses();
});

// Close modal when clicking outside
statusModal.addEventListener('click', (e) => {
  if (e.target === statusModal) {
    closeStatusModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !statusModal.classList.contains('hidden')) {
    closeStatusModal();
  }
}); 