// async function handleLogin(event) {
//     event.preventDefault(); // Prevent default form submission

//     const emailInput = document.getElementById('email');
//     const passwordInput = document.getElementById('password');

//     const email = emailInput.value;
//     const password = passwordInput.value;

//     try {
//         const response = await fetch('/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ email, password })
//         });
//         console.log(response);
//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Login failed');
//         } else {
//             const data = await response.json();
//             alert(data.message + " Your cart Id is " + data.user.cartId);

//             window.location.href = '/'; // Redirect to the home page after alert
//         }
//     } catch (error) {
//         console.error('Error during login:', error);
//         alert('An error occurred during login. Please try again.');
//     }
// }
