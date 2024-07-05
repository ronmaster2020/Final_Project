async function loadProducts(query = {}) {
    // initialize the products table
    $('#productsTable table tbody').empty();

    // Start loading indicator
    let loadingText = 'loading';
    const loadingIndicator = $('#loadingIndicator');
    const tableBody = $('#productsTable table tbody');
    const loadTxt = $('#loadTxt');
    loadTxt.text(loadingText);

    loadingIndicator.removeClass('d-none');
    tableBody.addClass('d-none');

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
    tableBody.removeClass('d-none');
    
    // display the products data in the products table
    $('#productsTable h2').text(products.length + ' items')
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
            <tr id="row-${product._id}">
                <td>${product._id}</td>
                <td>${product.name}</td>
                <td>${product.price}<span style="color: rgb(63, 115, 63)">$</span></td>
                <td>${gender}</td>
                <td>${product.size}<span style="color: rgb(0, 51, 153)">ml</span></td>
                <td>
                    <div class="d-flex align-items-center" style="height: 30px; max-width: 150px;">
                        <button class="action-btn" onclick="editProduct('${product._id}')">
                            <span class="material-symbols-sharp">edit</span>     
                        </button>
                        <button style="color: rgb(169, 0, 0);" class="action-btn delete" onclick="deleteProduct('${product._id}').then(response => {console.log('Product deleted successfully', response);}).catch(error => {console.error('Deletion failed', error);});">
                            <span class="material-symbols-sharp">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadProducts(); // Load all products when the page loads
    const form = document.querySelector('form'); // Assuming there's only one form on the page
    const deleteBtns = document.querySelectorAll('.action-btn.delete');

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

// delete product
function deleteProduct(productId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/product/delete/${productId}`,
            method: 'POST',
            success: function(response) {
                console.log('Product deleted', response);
                $(`#row-${productId}`).remove();
                resolve(response);
            },
            error: function(xhr, status, error) {
                console.error('Error deleting a product', error);
                reject(error);
            }
        });
    });
}