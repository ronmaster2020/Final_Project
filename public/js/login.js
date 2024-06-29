async function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        console.log('Login response:', data); // Log the entire response for debugging

        if (data.message === 'Login successful!') {
            alert(data.message + " Your cart Id is " + data.user.cartId);
            //Setting localStorage items to use them in other scripts
            localStorage.setItem('cartId', data.user.cartId);
            localStorage.setItem('isLogedIn', data.isLogedIn);

            window.location.href = '/'; // Redirect to the home page after alert
        } else {
            console.error('Login failed:', data.message);
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again.');
    }
}
