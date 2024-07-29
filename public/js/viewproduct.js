document.addEventListener("DOMContentLoaded", () => {
    const limit = 10;
    let page = 1;

    initializeFiltersFromURL();
    loadProducts();

    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const productId = event.target.getAttribute('data-product-id');
            const quantity = document.querySelector(`#quantity-input-${productId}`).value || 1;
            await addToCart(productId, quantity);
        } else if (event.target.closest('.product-card') && !event.target.classList.contains('quantity-btn')) {
            const productId = event.target.closest('.product-card').getAttribute('data-product-id');
            showProductModal(productId);
        }
    });
    

    document.getElementById('applyFiltersBtn').addEventListener('click', updateFilters);

    document.querySelectorAll('input[name="gender"]').forEach(radio => {
        radio.addEventListener('change', updateFilterValues);
    });

    document.getElementById('min-price').addEventListener('change', updateFilterValues);
    document.getElementById('max-price').addEventListener('change', updateFilterValues);

    $('#paginationControls').on('click', 'a', function(event) {
        event.preventDefault();
        const newPage = parseInt($(this).text(), 10);
        changePage(newPage);
    });

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
                throw new Error(`Failed to fetch products, status: ${response.status}`);
            }

            const products = await response.json();
            if (!products || !products.products || !Array.isArray(products.products)) {
                throw new Error('Invalid response format');
            }

            displayProducts(products.products);
            generatePagination(products.totalProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            document.getElementById('productsContainer').innerHTML = '<p>Error loading products. Please try again later.</p>';
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

        if (!products || !Array.isArray(products)) {
            console.error('Invalid products data:', products);
            container.innerHTML = '<p>Error loading products. Please try again later.</p>';
            return;
        }

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
                <button class="add-to-cart-btn" data-product-id="${product._id}">Add to Cart</button>
            `;

            container.appendChild(productDiv);
        });

        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
    }

    function handleQuantityChange(event) {
        const button = event.target;
        const action = button.getAttribute('data-action');
        const productId = button.getAttribute('data-product-id');
        const input = document.getElementById(`quantity-input-${productId}`);
        let currentValue = parseInt(input.value);

        if (action === 'increment') {
            input.value = currentValue + 1;
        } else if (action === 'decrement' && currentValue > 1) {
            input.value = currentValue - 1;
        }
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

            if (addToCartResponse.ok) {
                if (addToCartResponse.redirected === true && addToCartResponse.url.includes('/login')) {
                    alert('Please login to add products to cart.');
                    return;
                }
            } else {
                throw new Error(`Failed to add product to cart, status: ${addToCartResponse.status}`);
            }

            console.log(addToCartResponse); // Debug log

            alert('Product added to cart!');
        } catch (error) {
            console.error('Error adding product to cart:', error);
            alert('Error adding product to cart. Please try again.');
        }
    }

    async function showProductModal(productId) {
        try {
            console.log(`Fetching product details for ID: ${productId}`);
            let product = null;
            $.ajax({
                url: `/product/${productId}`,
                method: 'GET',
                success: function(response) {
                    product = response.product;
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error fetching product details:', errorThrown);
                    alert('Error fetching product details. Please try again later.');
                },
                async: false
            });

            if (!product) {
                console.error('Invalid product data:', product);
                alert('Error fetching product details. Please try again later.');
                return;
            }
            const genderLabel = getGenderLabel(product.gender);

            const modalProductImage = document.getElementById('modalProductImage');
            const modalProductName = document.getElementById('modalProductName');
            const modalProductDescription = document.getElementById('modalProductDescription');
            const modalProductGender = document.getElementById('modalProductGender');
            const modalProductPrice = document.getElementById('modalProductPrice');
            const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');
            const modalQuantityInput = document.getElementById('modalQuantityInput');

            if (modalProductImage) {
                modalProductImage.src = product.images[0];
            }
            if (modalProductName) {
                modalProductName.text

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

    function updateFilters() {
        page = 1;
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
    function updateFilterValues() {
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const minPrice = document.getElementById('min-price').value;
        const maxPrice = document.getElementById('max-price').value;

        // Update the URL parameters without reloading the page
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('gender', gender);
        urlParams.set('priceMin', minPrice);
        urlParams.set('priceMax', maxPrice);

        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState(null, '', newUrl);

        // Optionally, you can call loadProducts here to update the products displayed based on new filter values
        loadProducts();
    }})