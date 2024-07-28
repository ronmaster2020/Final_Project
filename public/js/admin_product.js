let limit = 10;
let page = 1;

async function loadProducts(products, totalProducts) {
    // display the products data in the products table
    $('#productsTable table tbody').empty();
    $('#productsTable h2').text(totalProducts + ' items')

    for (let i = 0; i < products.length; i++) {
        let product = products[i];

        let outOfStock = "";
        if (product.stock === 0) {
            outOfStock = "outOfStock";
        }
        let gender = "transgender"
        switch (product.gender) {
            case '1':
                gender = 'male'
                break;
            case '2':
                gender = 'female'
                break;
        }
        $('#productsTable table tbody').append(`
            <tr id="row-${product._id}" class="${outOfStock}">
                <td>${product._id}</td>
                <td>
                    <div class="d-flex flex-row flex-nowrap align-items-center justify-content-between">
                        <div class="d-flex flex-row flex-nowrap align-items-center justify-content-start" style="margin-right: 0.5rem">
                            <img src="/${product.images[0]}" alt="${product.name}" style="margin-right: 0.5rem">
                            ${product.name}
                        </div>
                        <span class="material-symbols-sharp">
                            ${gender}
                        </span>
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

    filterProducts();
    
    $("#resetBtn").click(function() {
        $("form").trigger('reset');
        filterProducts();
    });

    // Prevent form submission on Enter key press in the name input field
    $('#filterForm input[name="name"]').on('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            page = 1;
            filterProducts();
        }
    });

    // Event listener for other form inputs
    $("#filterForm").on('change', function(event) {
        if (event.target.name === 'name') {
            return;
        }
        event.preventDefault(); // Prevent the form from submitting traditionally
        page = 1;
        filterProducts();
    });

    $("#searchBtn").click(function(event) {
        event.preventDefault();
        page = 1;
        filterProducts();
    });

    $('#paginationControls').on('click', 'a', function(event) {
        event.preventDefault();
        const newPage = parseInt($(this).text(), 10);
        changePage(newPage);
    });
});

async function filterProducts() {
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
        stockMax,
        limit: limit,
        page: page
    };

    $('#paginationControls').addClass('d-none');

    const {products, totalProducts} = await fetchData(query, '/products/search', 'GET', $('#productsTable table tbody'));

    loadProducts(products, totalProducts);
    generatePagination(totalProducts);

    $('#paginationControls').removeClass('d-none');
}
function generatePagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / limit);
    $('#paginationControls').empty();
    for (let i = 1; i <= totalPages; i++) {
        $('#paginationControls').append(`
            <li class="page-item ${i === page ? 'active' : ''}">
                <a class="page-link" href="#">${i}</a>
            </li>
        `);
    }
}
function changePage(newPage) {
    page = newPage;
    filterProducts();
}

// delete product
function deleteProduct(productId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/product/delete/${productId}`,
            method: 'POST',
            success: function(response) {
                const product = response.product;
                filterProducts();
                showToast('Product deleted successfully', `<div>ID: ${product._id}</div><div>Name: ${product.name}</div>`, 'success');
                resolve(response);
            },
            error: function(xhr, status, error) {
                console.error('Error deleting a product', error);
                // error deleting toast
                showToast('Error deleting product', 'Please try again later', 'error');
                reject(error);
            }
        });
    });
}

function addProducts(event) {
    event.preventDefault(); // Prevent the default form submission

    var formData = new FormData(document.getElementById('productForm'));
    var maxTotalFileSize = 10 * 1024 * 1024; // 10 MB
    var files = formData.getAll('productImage');
    var totalFileSize = 0;
    
    for (var i = 0; i < files.length; i++) {
        totalFileSize += files[i].size;
    }
    
    if (totalFileSize > maxTotalFileSize) {
        showToast('Error', 'The total size of all files exceeds the maximum limit of 10 MB.');
        return;
    }
    
    $.ajax({
        url: '/product/create',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            showToast('Success', 'Product created successfully.', 'success');
            $('#productModal').modal('hide');
            filterProducts();
        },
        error: function(xhr, status, error) {
            showToast('Error', 'Failed to create product.', 'error');
            $('#productModal').modal('hide');
        }
    });
}

function showToast(title, message, status) {
    let color;
    switch (status) {
        case 'success':
            color = 'rgb(230, 255, 230)';
            break;
        case 'error':
            color = 'rgb(255, 230, 230)';
            break;
        default:
            color = 'rgb(0, 0, 0)';
    }
    const toast = $(`
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-delay="5000">
            <div class="toast-header" style="background-color: ${color}">
                <strong class="mr-auto">${title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `);
    $('.toast-container').append(toast);
    toast.toast('show');
    setTimeout(() => {
        toast.toast('hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}