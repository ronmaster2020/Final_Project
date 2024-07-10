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

async function fetchData(query, url, method, data_container) {
    $('#loadingBar .progress-bar').css('width', '0%');
    data_container.addClass('d-none');
    $('#loadingBar').removeClass('d-none');
    $('#loadingBar .progress-bar').animate({ width: '100%' }, 1000);
    // fetch data
    const queryParams = new URLSearchParams(query).toString();
    const response = await fetch(`${url}?${queryParams}`, {
        method: method, // GET request
        headers: {
            'Content-Type': 'application/json', // Assuming the server expects JSON
        },
    });

    if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        $('#loadingBar').addClass('d-none');
        return;
    }
    let data = await response.json();

    $('#loadingBar').addClass('d-none');
    $('#loadingBar .progress-bar').css('width', '0%');
    data_container.removeClass('d-none');



    return data;
}