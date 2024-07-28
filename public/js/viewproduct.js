document.addEventListener("DOMContentLoaded", () => {
    initializeFiltersFromURL();
    loadProducts();

    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const productId = event.target.getAttribute('data-product-id');
            const quantity = event.target.getAttribute('data-product-quantity') || 1;
            await addToCart(productId, quantity);
        } else if (event.target.closest('.product-card')) {
            const productId = event.target.closest('.product-card').getAttribute('data-product-id');
            showProductModal(productId);
        }
    });

    // Removed event listeners from inputs
    // document.getElementById('sort').addEventListener('change', updateFilters);
    // document.querySelectorAll('input[name="gender"]').forEach(radio => {
    //     radio.addEventListener('change', updateFilters);
    // });
    // document.getElementById('min-price').addEventListener('change', updateFilters);
    // document.getElementById('max-price').addEventListener('change', updateFilters);

    // Added event listener for the apply filters button
    document.getElementById('applyFiltersBtn').addEventListener('click', updateFilters);
});

function initializeFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const genderFilter = urlParams.get('gender') || 'all';
    const sortBy = urlParams.get('sort') || 'price_asc';
    const minPrice = urlParams.get('minPrice');
    const maxPrice = urlParams.get('maxPrice');

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

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card';
        productDiv.setAttribute('data-product-id', product._id);

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

        const products = await fetchJson(apiUrl);
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        console.error(`Error fetching URL: ${url}`);
        if (response.status === 404) {
            throw new Error('Resource not found (404)');
        }
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        console.error('Response:', await response.text());
        throw new Error('Expected JSON response but received something else');
    }

    return await response.json();
}

async function showProductModal(productId) {
    try {
        console.log(`Fetching product details for ID: ${productId}`);
        const product = await fetchJson(`/product/${productId}`);
        const genderLabel = getGenderLabel(product.gender);

        const modalProductImage = document.getElementById('modalProductImage');
        const modalProductName = document.getElementById('modalProductName');
        const modalProductDescription = document.getElementById('modalProductDescription');
        const modalProductGender = document.getElementById('modalProductGender');
        const modalProductPrice = document.getElementById('modalProductPrice');
        const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');

        if (modalProductImage) {
            modalProductImage.src = product.images[0];
        }
        if (modalProductName) {
            modalProductName.textContent = product.name;
        }
        if (modalProductDescription) {
            modalProductDescription.textContent = product.DESC;
        }
        if (modalProductGender) {
            modalProductGender.textContent = `Gender: ${genderLabel}`;
        }
        if (modalProductPrice) {
            modalProductPrice.textContent = `$${product.price}`;
        }
        if (modalAddToCartBtn) {
            modalAddToCartBtn.setAttribute('data-product-id', product._id);
        }

        const productModalElement = document.getElementById('productModal');
        if (productModalElement) {
            const productModal = new bootstrap.Modal(productModalElement);
            productModal.show();
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
        alert('Error fetching product details. Please try again later.');
    }
}
