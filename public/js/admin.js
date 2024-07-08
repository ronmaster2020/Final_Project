var sideNavbar = true;

$('document').ready(function() {
    addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            $('nav').removeClass('translateX-100');
            sideNavbar = false;
        } else {
            $('nav').addClass('translateX-100');
            sideNavbar = true;
        }
    });
});

function openSideNavbar() {
    var nav = $('nav');

    if (sideNavbar) {
        nav.removeClass('translateX-100');
        sideNavbar = false;

    } else {
        nav.addClass('translateX-100');
        sideNavbar = true;
    }
}

