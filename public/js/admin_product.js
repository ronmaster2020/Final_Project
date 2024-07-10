async function loadProducts(products, query = {}) {
    // Filter products based on the query
    const filteredProducts = products.filter(product => {
        let matches = true;

        if (query.name && !product.name.toLowerCase().includes(query.name.toLowerCase())) {
            matches = false;
        }
        if (query.gender && product.gender !== query.gender) {
            matches = false;
        }
        if (query.priceMin && product.price < query.priceMin) {
            matches = false;
        }
        if (query.priceMax && product.price > query.priceMax) {
            matches = false;
        }
        if (query.sizeMin && product.size < query.sizeMin) {
            matches = false;
        }
        if (query.sizeMax && product.size > query.sizeMax) {
            matches = false;
        }
        if (query.stockMin && product.stock < query.stockMin) {
            matches = false;
        }
        if (query.stockMax && product.stock > query.stockMax) {
            matches = false;
        }

        return matches;
    });
    // display the products data in the products table
    $('#productsTable table tbody').empty();
    $('#productsTable h2').text(filteredProducts.length + ' items')
    for (let i = 0; i < filteredProducts.length; i++) {
        let product = filteredProducts[i];

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

$(document).ready(async function() {
    $('#productsTable h2').text('fetching data...')

    let products = await fetchData({}, '/products/search', 'GET', $('#productsTable table tbody'));

    loadProducts(products); // Load all products when the page loads
    const form = $('form');

    $("#resetBtn").click(function() {
        form.trigger('reset');
        loadProducts(products);
    });

    form.on('change', function(event) {
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

        const query = {
            name,
            gender,
            priceMin,
            priceMax,
            sizeMin,
            sizeMax,
            stockMin,
            stockMax
        };

        loadProducts(products, query);
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