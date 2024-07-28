let limit = 12;
let page = 1;

document.addEventListener("DOMContentLoaded", () => {
    initializeFiltersFromURL();
    loadProducts();

    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const productId = event.target.getAttribute('data-product-id');
            const quantity = event.target.getAttribute('data-product-quantity');
            await addToCart(productId, quantity);
        }
    });

    document.getElementById('sort').addEventListener('change', updateFilters);

    document.querySelectorAll('input[name="gender"]').forEach(radio => {
        radio.addEventListener('change', updateFilters);
    });

    document.getElementById('min-price').addEventListener('change', (event) => {
        event.preventDefault();
        updateFilters();
    });
    document.getElementById('min-price').addEventListener('change', (event) => {
        event.preventDefault();
        updateFilters();
    });

    $('#paginationControls').on('click', 'a', function(event) {
        event.preventDefault();
        const newPage = parseInt($(this).text(), 10);
        changePage(newPage);
    });
});

function initializeFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const genderFilter = urlParams.get('gender') || 'all';
    const sortBy = urlParams.get('sort') || 'price_asc';
    const minPrice = urlParams.get('priceMin');
    const maxPrice = urlParams.get('priceMax');

    document.querySelector(`input[name="gender"][value="${genderFilter}"]`).checked = true;
    document.getElementById('sort').value = sortBy;
    if (minPrice) {
        document.getElementById('min-price').value = minPrice;
    }
    if (maxPrice) {
        document.getElementById('max-price').value = maxPrice;
    }
}


function getGenderLabel(genderValue) {
    switch (genderValue) {
        case '1':
            return 'Male';
        case '2':
            return 'Female';
        case '3':
            return 'Unisex';
        default:
            return 'Unknown';
    }
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';
    console.log(products);
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card';

        const genderLabel = getGenderLabel(product.gender);

        productDiv.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}">
            <div class="product-info">
                <h2>${product.name}</h2>
                <p>${product.DESC}</p>
                <div class="product-details">
                    <span class="gender">${genderLabel}</span>
                    <span class="price">$${product.price}</span>
                </div>
            </div>
            <button class="add-to-cart-btn" data-product-id="${product._id}" data-product-quantity="1">Add to Cart</button>
        `;

        container.appendChild(productDiv);
    });
}

async function addToCart(productId, quantity) {
    console.log(`Adding product to cart with ID: ${productId}`); // Debug log
    try {
        const addToCartResponse = await fetch(`/cart/add/${productId}/${quantity}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!addToCartResponse.ok) {
            throw new Error('Failed to add product to cart');
        }

        alert('Product added to cart!');
    } catch (error) {
        console.error('Error adding product to cart:', error);
        alert('Error adding product to cart. Please try again.');
    }
}

function updateFilters() {
    const sortBy = document.getElementById('sort').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;

    let newUrl = `/products?sort=${sortBy}`;
    if (gender && gender !== 'all') {
        newUrl += `&gender=${gender}`;
    }
    if (minPrice) {
        newUrl += `&priceMin=${minPrice}`;
    }
    if (maxPrice) {
        newUrl += `&priceMax=${maxPrice}`;
    }

    window.location.href = newUrl;
}


async function loadProducts() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const genderFilter = urlParams.get('gender');
        const sortBy = urlParams.get('sort') || 'price_asc';
        const minPrice = urlParams.get('priceMin');
        const maxPrice = urlParams.get('priceMax');

        let apiUrl = `/products/search?sort=${sortBy}`;
        if (genderFilter && genderFilter !== 'all') {
            apiUrl += `&gender=${genderFilter}`;
        }
        if (minPrice) {
            apiUrl += `&priceMin=${minPrice}`;
        }
        if (maxPrice) {
            apiUrl += `&priceMax=${maxPrice}`;
        }
        apiUrl += `&limit=${limit}&page=${page}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const products = await response.json();
        displayProducts(products.products);
        generatePagination(products.totalProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
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
    loadProducts();
    $('#main-content').animate({ scrollTop: 0 }, 'smooth');
}
