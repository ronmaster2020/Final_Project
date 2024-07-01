document.addEventListener('DOMContentLoaded', async () => {
    try {
        const userId = '667d8e9fb4faf3dfa209d262'; //replace with actual user ID from session or token
       
        
        //Fetch and populate form with user details
       
        const userDetailsResponse = await fetch(`/getUserDetails/${userId}`)
        const userDetails = await userDetailsResponse.json();
        if (userDetails) {
            document.getElementById('firstName').value = userDetails.firstName || '';
            document.getElementById('lastName').value = userDetails.lastName || '';
            document.getElementById('bio').value = userDetails.bio || '';
            document.getElementById('address').value = userDetails.address || '';
            document.getElementById('phoneNumber').value = userDetails.phoneNumber || '';
            document.getElementById('email').value = userDetails.email || '';
            document.getElementById('profilePicture').src = userDetails.profilePicture || 'https://vectorified.com/images/no-profile-picture-icon-24.jpg';
        }
        document.getElementById('userName').innerText = `Welcome back ${document.getElementById('firstName').value} ${document.getElementById('lastName').value}!`;
        // event listener for form submission
        const userForm = document.getElementById('user-form');
        userForm.addEventListener('submit', async (event) => {
            event.preventDefault(); //prevent form submission

            //Collect updated data from form
            const updatedUserData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                bio: document.getElementById('bio').value,
                address: document.getElementById('address').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };
            
            try {
                // Send updated data to server using POST
                const updateResponse = await fetch(`/updateUser/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedUserData)
                });

                const updateResult = await updateResponse.json();
                if (updateResponse.ok) {
                    console.log('User updated successfully:', updateResult.message);
                    //Optionally update UI or show a success message
                } else {
                    console.error('Failed to update user:', updateResult.error);
                    //Handle error or show error message
                }
            } catch (error) {
                console.error('Error updating user:', error.message);
                //Handle fetch or server error
            }
        });

    } catch (error) {
        console.error('Error loading user data:', error);
    }
});
