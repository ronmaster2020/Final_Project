async function loadProducts() {
    const sortOption = document.getElementById('sort').value;
    try {
        const response = await fetch('/product/all');
        let products = await response.json();

        // Sort products based on the selected option
        products = products.sort((a, b) => {
            if (sortOption === 'price' || sortOption === 'size') {
                return a[sortOption] - b[sortOption];
            } else {
                return a[sortOption].localeCompare(b[sortOption]);
            }
        });

        const productGrid = document.getElementById('productGrid');
        productGrid.innerHTML = '';

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            productCard.innerHTML = `
                <img src="path/to/default/image.jpg" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.DESC}</p>
                <p class="price">$${product.price}</p>
                <p>Gender: ${product.gender === 1 ? 'Male' : product.gender === 2 ? 'Female' : 'Unisex'}</p>
                <p>Size: ${product.size} ml</p>
            `;

            productGrid.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadProducts);
