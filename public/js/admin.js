var sideNavbar = true;

$(document).ready(function() {
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
        method: method,
        headers: {
            'Content-Type': 'application/json',
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

Date.prototype.getWeek = function(dowOffset) {
    /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */
    dowOffset = typeof(dowOffset) == 'number' ? dowOffset : 0; //default dowOffset to zero
    var newYear = new Date(this.getFullYear(), 0, 1);
    var day = newYear.getDay() - dowOffset; //the day of week the year begins on
    day = (day >= 0 ? day : day + 7);
    var daynum = Math.floor((this.getTime() - newYear.getTime() - 
        (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    var weeknum;
    //if the year starts before the middle of a week
    if (day < 4) {
        weeknum = Math.floor((daynum + day - 1) / 7) + 1;
        if (weeknum > 52) {
            var nYear = new Date(this.getFullYear() + 1, 0, 1);
            var nday = nYear.getDay() - dowOffset;
            nday = nday >= 0 ? nday : nday + 7;
            //if the next year starts before the middle of the week, it is week #1 of that year
            weeknum = nday < 4 ? 1 : 53;
        }
    } else {
        weeknum = Math.floor((daynum + day - 1) / 7);
    }
    return weeknum;
};
 