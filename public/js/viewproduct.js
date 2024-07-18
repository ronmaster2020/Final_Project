document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});

function loadProducts() {
    fetch('/products/search?sort=price') // Default sort by price
        .then(response => response.json())
        .then(products => {
            displayProducts(products);
        })
        .catch(error => console.error('Error fetching products:', error));
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card';

        productDiv.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}"> <!-- Make sure the image path is correct -->
            <div class="product-info">
                <h2>${product.name}</h2>
                <p>${product.DESC}</p>
                <p class="price">$${product.price}</p>
            </div>
            <button>Add to Cart</button>
        `;

        container.appendChild(productDiv);
    });
}

function sortProducts() {
    const sortBy = document.getElementById('sort').value;
    console.log(`Sorting by: ${sortBy}`);  // Debug log

    fetch(`/products/search?sort=${sortBy}`)
        .then(response => response.json())
        .then(products => {
            console.log(products);  // Debug log
            displayProducts(products);
        })
        .catch(error => console.error('Error sorting products:', error));
}
