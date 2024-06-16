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
            console.log("Navbar loaded successfully.");
        });
    });
});

// load bootstrap js just before the </body>
$(function() {
    $(document).ready(function() {
        $("body").append(`
            <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
        `);
        console.log("Bootstrap JS loaded successfully.");
    });
});