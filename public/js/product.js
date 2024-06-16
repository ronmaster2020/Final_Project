async function loadProducts(query = {}) {
    // initialize the products table
    $('#productsTable table tbody').empty();

    // Start loading indicator
    let loadingText = 'loading';
    const loadingIndicator = $('#loadingIndicator');
    const table = $('#productsTable table');
    const loadTxt = $('#loadTxt');
    loadTxt.text(loadingText);

    loadingIndicator.removeClass('d-none');
    table.addClass('d-none');

    const interval = setInterval(() => {
        loadingText = loadingText.length < 10 ? loadingText + '.' : 'loading';
        loadTxt.text(loadingText);
    }, 500);
    
    // get products data from the server route
    const queryParams = new URLSearchParams(query).toString();
    const response = await fetch(`/products/search?${queryParams}`, {
        method: 'GET', // GET request
        headers: {
            'Content-Type': 'application/json', // Assuming the server expects JSON
        },
    });
    const products = await response.json();

    // Stop loading indicator
    clearInterval(interval);
    loadingIndicator.addClass('d-none');
    table.removeClass('d-none');
    
    // display the products data in the products table
    $('#productsTable h2').text('Products - ' + products.length + ' items')
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        let gender = parseInt(product.gender, 10);
        switch (gender) {
            case 1:
                gender = 'male';
                break;
            case 2:
                gender = 'female';
                break;
            case 3:
                gender = 'unisex';
                break;
            default:
                break;
        }
        $('#productsTable table tbody').append(`
            <tr>
                <th scope="row">${i+1}</th>
                <td>${product._id}</td>
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${gender}</td>
                <td>${product.size}</td>
            </tr>
        `);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadProducts(); // Load all products when the page loads
    const form = document.querySelector('form'); // Assuming there's only one form on the page

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting traditionally

        // Construct the query from form inputs
        const fLetter = document.querySelector('input[name="fLetter"]').value;
        const price = $("#priceRange").val();
        const gender = $("#genderCategory").val();
        const size = $("#sizeRange").val();

        // Assuming you want to construct a query string
        const query = `fLetter=${fLetter}&price=${price}&gender=${gender}&size=${size}`;

        // Call your loadProducts function with the query
        loadProducts(query);
    });
});

                // <td class="Actions-column">
                //     <div class="action-btns">
                //         <button class="edit-btn" onclick="editproduct(${i + 1})">
                //             <img id="edit-img" src="/images/edit-button.png" alt="edit" />
                //         </button>
                //         <button class="delete-btn" onclick="deleteproduct(${i + 1})">
                //             <img id="delete-img" src="/images/delete-button.png" alt="delete" />
                //         </button>
                //     </div>
                // </td>