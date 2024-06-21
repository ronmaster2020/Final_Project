// loads common head content to all pages
$(function() {
    $.get("/partials/head.html", function(data) {
        $("head").prepend(data);
        console.log("Common head content loaded successfully.");
    });
});

//load navbar to all pages
$(function() {
    $(document).ready(function() {
        // Load the navbar
        $("#navbar-placeholder").load("/partials/navbar.html", function() {
            // After the navbar is loaded, determine the active nav-item
            var path = window.location.pathname;
            if (path === "/") {
                $("#nav-home").addClass("active");
            } else if (path.startsWith("/products")) {
                $("#nav-products").addClass("active");
            } else if (path.startsWith("/about")) {
                $("#nav-about").addClass("active");
            } else if (path.startsWith("/contact")) {
                $("#nav-contact").addClass("active");
            }
            console.log("Navbar loaded successfully.");
        });
    });
});

// load bootstrap js just before the </body>
$(function() {
    $(document).ready(function() {
        $("body").append(`
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
        `);
        console.log("Bootstrap JS loaded successfully.");
    });
});

// add to cart
function addToCart(productId) {
    $.ajax({
        url: `/cart/add/${productId}`,
        body: JSON.stringify({ id: '6671c47201450ff3e03b16e3' }),
        method: 'POST',
        contentType: 'application/json',
        success: function(response) {
            console.log('Product added to cart', response);
        },
        error: function(xhr, status, error) {
            console.error('Error adding product to cart', error);
        }
    });
}

// delete product
function deleteProduct(productId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/product/delete/${productId}`,
            method: 'POST',
            success: function(response) {
                console.log('Product deleted', response);
                resolve(response);
            },
            error: function(xhr, status, error) {
                console.error('Error deleting a product', error);
                reject(error);
            }
        });
    });
}