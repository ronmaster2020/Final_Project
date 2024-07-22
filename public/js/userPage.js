document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch and populate form with user details
        const userDetailsResponse = await fetch(`/getUserDetails`);
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

        // Event listener for form submission
        const userForm = document.getElementById('user-form');
        userForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // prevent form submission

            // Collect updated data from form
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
                const updateResponse = await fetch(`/updateUser`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedUserData)
                });

                const updateResult = await updateResponse.json();
                if (updateResponse.ok) {
                    showPopup('Profile updated successfully!');
                    console.log('User updated successfully:', updateResult.message);
                } else {
                    showPopup('Failed to update profile.', true);
                    console.error('Failed to update user:', updateResult.error);
                }
            } catch (error) {
                showPopup('Error updating profile.', true);
                console.error('Error updating user:', error.message);
            }
        });

        // Initialize the map
        let map = L.map('map').setView([51.505, -0.09], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Function to validate the address and display it on the map
        async function validateAndShowAddress(address) {
            console.log(`Validating address: ${address}`); // Debugging line to check the address input

            try {
                // Use the Nominatim API to get the address details
                const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
                console.log('Nominatim response:', response); // Debugging line to check the API response

                if (response.data.length > 0) {
                    const location = response.data[0];
                    const latLng = [parseFloat(location.lat), parseFloat(location.lon)];

                    console.log(`Coordinates: ${latLng}`); // Debugging line to check the coordinates

                    // Clear existing markers
                    map.eachLayer((layer) => {
                        if (layer instanceof L.Marker) {
                            map.removeLayer(layer);
                        }
                    });

                    // Set map view and add a marker
                    map.setView(latLng, 13);
                    L.marker(latLng).addTo(map)
                        .bindPopup(`<b>${location.display_name}</b>`).openPopup();
                } else {
                    console.error('No results found'); // Debugging line to log if no results are found
                    alert('Address not found');
                }
            } catch (error) {
                console.error('Error fetching address:', error); // Debugging line to log errors
                alert('Error fetching address');
            }
        }

        // Validate and show address on map when user details are fetched
        if (userDetails.address) {
            validateAndShowAddress(userDetails.address);
        }

        // Validate and show address on map when the address is updated in the form
        document.getElementById('address').addEventListener('change', (event) => {
            validateAndShowAddress(event.target.value);
        });
    } catch (error) {
        showPopup('Error loading user data.', true);
        console.error('Error loading user data:', error);
    }
});