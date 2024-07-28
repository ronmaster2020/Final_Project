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
            document.getElementById('email').value = userDetails.email || '';
            document.getElementById('profilePicture').src = userDetails.profilePicture || 'https://vectorified.com/images/no-profile-picture-icon-24.jpg';
        }

        document.getElementById('userName').innerText = `Welcome back ${document.getElementById('firstName').value} ${document.getElementById('lastName').value}!`;

        // Initialize the map
        await customElements.whenDefined('gmp-map');

        const map = document.querySelector("gmp-map");
        const marker = document.getElementById("marker");
        const placePicker = document.getElementById("place-picker");
        const infowindowContent = document.getElementById("infowindow-content");
        const infowindow = new google.maps.InfoWindow();

        map.innerMap.setOptions({mapTypeControl: false});
        infowindow.setContent(infowindowContent);

        placePicker.addEventListener('gmpx-placechange', () => {
            const place = placePicker.value;

            if (!place.location) {
                window.alert("No details available for input: '" + place.name + "'");
                infowindow.close();
                marker.position = null;
                return;
            }

            if (place.viewport) {
                map.innerMap.fitBounds(place.viewport);
            } else {
                map.center = place.location;
                map.zoom = 17;
            }

            marker.position = place.location;
            infowindowContent.children["place-name"].textContent = place.displayName;
            infowindowContent.children["place-address"].textContent = place.formattedAddress;
            infowindow.open(map.innerMap, marker);
        });

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
                    if (updatedUserData.address) {
                        validateAndShowAddress(updatedUserData.address);
                    }
                } else {
                    showPopup('Failed to update profile.', true);
                    console.error('Failed to update user:', updateResult.error);
                }
            } catch (error) {
                showPopup('Error updating profile.', true);
                console.error('Error updating user:', error.message);
            }
        });

        // Function to validate the address and display it on the map
        async function validateAndShowAddress(address) {
            try {
                // Simulating the validation and display process
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address': address }, (results, status) => {
                    if (status == 'OK') {
                        map.innerMap.setCenter(results[0].geometry.location);
                        marker.position = results[0].geometry.location;
                        infowindowContent.children["place-name"].textContent = results[0].formatted_address;
                        infowindowContent.children["place-address"].textContent = address;
                        infowindow.open(map.innerMap, marker);
                    } else {
                        alert('Geocode was not successful for the following reason: ' + status);
                    }
                });
            } catch (error) {
                console.error('Error fetching address:', error);
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