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
    // initialize data container
    data_container.empty();
    // Start loading indicator
    let loadingText = 'loading';
    const loadingIndicator = $('#loadingIndicator');
    const loadTxt = $('#loadTxt');
    loadTxt.text(loadingText);

    loadingIndicator.removeClass('d-none');
    data_container.addClass('d-none');

    const interval = setInterval(() => {
        loadingText = loadingText.length < 10 ? loadingText + '.' : 'loading';
        loadTxt.text(loadingText);
    }, 500);
    
    // get products data from the server route
    const queryParams = new URLSearchParams(query).toString();
    const response = await fetch(`${url}?${queryParams}`, {
        method: method, // GET request
        headers: {
            'Content-Type': 'application/json', // Assuming the server expects JSON
        },
    });

    // Stop loading indicator
    clearInterval(interval);
    loadingIndicator.addClass('d-none');
    data_container.removeClass('d-none');

    if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
    }

    return await response.json();
}