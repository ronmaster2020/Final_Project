// loads common head content to all pages
$(function() {
    $("head").load("/partials/head.html", function() {
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
        });
    });
});