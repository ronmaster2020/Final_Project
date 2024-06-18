async function loadProducts(query = {}) {
    // initialize the products table
    $('#productsTable table tbody').empty();
    $('#tableTitle h2').text('Products - ');

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
    $('#tableTitle h2').text('Products - ' + products.length + ' items')
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
                <td>
                    <button class="add-to-cart-btn rounded" onclick="addToCart('${product._id}')">
                        <div class="d-flex justify-content-center align-items-center" style="height: 30px; width: 30px">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM252 160c0 11 9 20 20 20h44v44c0 11 9 20 20 20s20-9 20-20V180h44c11 0 20-9 20-20s-9-20-20-20H356V96c0-11-9-20-20-20s-20 9-20 20v44H272c-11 0-20 9-20 20z"/></svg>
                        </div>        
                    </button>
                </td>
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