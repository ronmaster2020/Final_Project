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

        let outOfStock = "";
        if (product.stock === 0) {
            outOfStock = "outOfStock";
        }
        $('#productsTable table tbody').append(`
            <tr id="row-${product._id}" class="${outOfStock}">
                <td>${product._id}</td>
                <td>
                    <div class="d-flex flex-row flex-nowrap align-items-center justify-content-start">
                        <img src="/${product.images[0]}" alt="${product.name}" style="margin-right: 1rem">
                        ${product.name}
                    </div>
                </td>
                <td>${product.price}<span style="color: rgb(63, 115, 63)">$</span></td>
                <td>${product.stock}</td>
                <td>${product.size}<span style="color: rgb(0, 51, 153)">ml</span></td>
                <td>
                    <div class="d-flex align-items-center justify-content-center" style="max-width: 150px;">
                        <button class="action-btn" onclick="editProduct('${product._id}')">
                            <span class="material-symbols-sharp">edit</span>     
                        </button>
                        <button style="color: rgb(169, 0, 0);" class="action-btn delete" onclick="deleteProduct('${product._id}')">
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

    $("#resetBtn").click(function() {
        $("#name").val('');
        $("#priceRange").val('');
        $("#genderCategory").val('');
        $("#sizeRange").val('');
        $("#stockRange").val('');
        loadProducts();
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting traditionally

        // Construct the query from form inputs
        const name = $('input[name="name"]').val();
        const gender = $("#genderCategory").val();

        const selectedPriceOption = $("#priceRange option:selected");
        const priceMin = selectedPriceOption.attr('data-min') || null;
        const priceMax = selectedPriceOption.attr('data-max') || null;

        const selectedSizeOption = $("#sizeRange option:selected");
        const sizeMin = selectedSizeOption.attr('data-min') || null;
        const sizeMax = selectedSizeOption.attr('data-max') || null;

        const selectedStockOption = $("#stockRange option:selected");
        const stockMin = selectedStockOption.attr('data-min') || null;
        const stockMax = selectedStockOption.attr('data-max') || null;


        // Assuming you want to construct a query string
        const query = `name=${name}&priceMin=${priceMin}&priceMax=${priceMax}&gender=${gender}&sizeMin=${sizeMin}&sizeMax=${sizeMax}&stockMin=${stockMin}&stockMax=${stockMax}`;

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
                const product = response.product;
                console.log('Product deleted', product);
                $(`#row-${productId}`).remove();
                const productCount = $('#productsTable table tbody tr').length;
                $('#productsTable h2').text(productCount + ' items');
                const toast = $(`
                    <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                        <div class="toast-header" style="background-color: rgb(230, 255, 230)">
                            <strong class="me-auto">Product deleted successfully</strong>
                            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div class="toast-body">
                            <div>ID: ${product._id}</div>
                            <div>Name: ${product.name}</div>
                        </div>
                    </div>`);
                $('.toast-container').append(toast)
                toast.toast('show');
                setTimeout(() => {
                    toast.toast('hide');
                    setTimeout(() => {
                        toast.remove();
                    }, 300);
                }, 3000);

                resolve(response);
            },
            error: function(xhr, status, error) {
                console.error('Error deleting a product', error);
                // error deleting toast
                const toast = $(`
                    <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                        <div class="toast-header" style="background-color: rgb(255, 230, 230)">
                            <strong class="me-auto">Error deleting product</strong>
                            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div class="toast-body">
                            <div>ID: ${productId}</div>
                            <div>Error: ${error}</div>
                        </div>
                    </div>`);
                $('.toast-container').append(toast)
                toast.toast('show');
                setTimeout(() => {
                    toast.toast('hide');
                    setTimeout(() => {
                        toast.remove();
                    }, 300);
                }, 3000);
                reject(error);
            }
        });
    });
}