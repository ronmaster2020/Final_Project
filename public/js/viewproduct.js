document.addEventListener("DOMContentLoaded", () => {
    loadProducts();

    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const productId = event.target.getAttribute('data-product-id');
            await addToCart(productId);
        }
    });
});

async function loadProducts() {
    try {
        const response = await fetch('/products/search?sort=price');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card';

        productDiv.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}">
            <div class="product-info">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p class="price">$${product.price}</p>
            </div>
            <button class="add-to-cart-btn" data-product-id="${product._id}">Add to Cart</button>
        `;

        container.appendChild(productDiv);
    });
}

async function addToCart(productId) {
    console.log(`Adding product to cart with ID: ${productId}`); // Debug log
    try {
        const response = await fetch('/api/userId');
        if (!response.ok) {
            throw new Error('Failed to fetch user ID and cart ID');
        }

        const data = await response.json();
        const { userId, cartId } = data;

        const addToCartResponse = await fetch(`/cart/add/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                cartId,
                quantity: 1,
                productId // Ensure productId is sent in the body
            })
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

function sortProducts() {
    const sortBy = document.getElementById('sort').value;

    fetch(`/products/search?sort=${sortBy}`)
        .then(response => response.json())
        .then(products => displayProducts(products))
        .catch(error => console.error('Error sorting products:', error));
}
