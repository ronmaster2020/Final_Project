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
    
            if (!response.ok) {
                const errorData = await response.json();
                showToast(errorData.message || 'Incorrect email or password');
            } else {
                // Follow the redirection URL provided by the server
                const redirectUrl = response.url;
                window.location.href = redirectUrl;
            }
        } catch (error) {
            console.error('Error during login:', error.message);
            showToast('Error during login.');
        }
    });
    
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = message;
        document.body.appendChild(toast);
    
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
    
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
});