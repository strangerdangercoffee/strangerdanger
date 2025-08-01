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
      // For now, we'll just show a success message
      // In a real implementation, you would send this data to your server
      showMessage('success', 'Thank you for your message! We\'ll get back to you soon.');
      
      // Clear the form
      contactForm.reset();
      
      // Optional: You could integrate with a service like EmailJS, Formspree, or your own backend
      // Example with EmailJS (would require EmailJS setup):
      // emailjs.send('service_id', 'template_id', {
      //   from_name: name,
      //   from_email: email,
      //   subject: subject,
      //   message: message
      // });
      
    } catch (error) {
      showMessage('error', 'An error occurred while sending your message. Please try again.');
      console.error('Contact form error:', error);
    }
  });
} 