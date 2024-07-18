/* table of contents */
/* 1. leadership */
/* 2. about */

/*********************/
/* 1.    leadership  */
/*********************/

$(document).ready(function(){
    $('#readMore1').click(function(){
        $('#moreText1').toggle('slow');
    });
    $('#readMore2').click(function(){
        $('#moreText2').toggle('slow');
    });
    $('#readMore3').click(function(){
        $('#moreText3').toggle('slow');
    });
    $('#readMore4').click(function(){
        $('#moreText4').toggle('slow');
    });
    $('#readMore5').click(function(){
        $('#moreText5').toggle('slow');
    });
});

/*********************/
/* 2.    about       */
/*********************/

$(document).ready(function(){
    $('#readMoreBtn1').click(function(){
        $('#moreContent1').toggle('slow');
    });
    $('#readMoreBtn2').click(function(){
        $('#moreContent2').toggle('slow');
    });
    $('#readMoreBtn3').click(function(){
        $('#moreContent3').toggle('slow');
    });

    // JavaScript to reorder Meet Our Team section on smaller screens
    function reorderMeetOurTeam() {
        var screenWidth = $(window).width();
        if (screenWidth <= 767.98) { // Small devices (phones)
            $('#appendlabel2').prependTo('.appendlabel1'); 
        } else {
            $('#appendlabel2').appendTo('#workvision'); 
        }
    }

    reorderMeetOurTeam();

    $(window).resize(function() {
        reorderMeetOurTeam();
    });
});