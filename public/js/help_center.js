document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('help-form');
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const email = document.getElementById('email').value;
      const problem = document.getElementById('problem').value;
  
      if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
      }
  
      const data = {
        firstName,
        lastName,
        email,
        problem
      };
  
      try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: 'service_oqn2ovo',
            template_id: 'template_av4g19s',
            user_id: process.env.EMAILJS_USER_ID, // Access user ID from environment variable
            template_params: data
          })
        });
  
        if (response.ok) {
          document.getElementById('confirmation').classList.remove('hidden');
          form.reset();
        } else {
          alert('There was a problem sending your message. Please try again later.');
        }
      } catch (error) {
        console.error('Error sending email:', error);
        alert('There was a problem sending your message. Please try again later.');
      }
    });
  
    function validateEmail(email) {
      const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      return re.test(String(email).toLowerCase());
    }
  });
  