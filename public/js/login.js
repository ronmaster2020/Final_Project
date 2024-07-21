document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);

                // Redirect to the user page or any other page
                window.location.href = '/userPage.html';
            } else {
                console.error('Login failed:', await response.text());
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error.message);
            alert('Error during login.');
        }
    });
});