// Contact Form Handler
const contactForm = document.getElementById('contact-form');

// Message handling functions
function showMessage(type, message) {
  // Remove any existing messages
  hideMessages();
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;
  
  // Insert message after the form
  contactForm.parentNode.insertBefore(messageElement, contactForm.nextSibling);
  
  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }
}

function hideMessages() {
  const existingMessages = document.querySelectorAll('.message');
  existingMessages.forEach(message => message.remove());
}

// Contact Form Handler
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const subject = formData.get('subject').trim();
    const message = formData.get('message').trim();
    
    // Basic validation
    if (!name || !email || !subject || !message) {
      showMessage('error', 'Please fill in all required fields.');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('error', 'Please enter a valid email address.');
      return;
    }
    
    try {
      // Submit form to Netlify
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });
      
      if (response.ok) {
        showMessage('success', 'Thank you for your message! We\'ll get back to you soon.');
        contactForm.reset();
      } else {
        throw new Error('Form submission failed');
      }
      
    } catch (error) {
      showMessage('error', 'An error occurred while sending your message. Please try again.');
      console.error('Contact form error:', error);
    }
  });
} 