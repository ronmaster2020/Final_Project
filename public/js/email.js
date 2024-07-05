(function () {
    emailjs.init('user_youruserid'); // Replace 'user_youruserid' with your actual User ID
})();

// Function to send email
function sendEmail(e) {
    e.preventDefault();

    emailjs.sendForm('service_oqn2ovo', 'template_av4g19s', e.target)
        .then(function(response) {
            console.log('Email sent:', response.status, response.text);
            alert('Message sent successfully!');
            document.getElementById("contact-form").reset(); // Reset form after successful submission
        }, function(error) {
            console.error('Email error:', error);
            alert('Message could not be sent. Please try again later.');
        });
}

// Add event listener to the form submit button
document.getElementById('contact-form').addEventListener('submit', sendEmail);