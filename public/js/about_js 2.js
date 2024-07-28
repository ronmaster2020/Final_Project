
$(document).ready(function(){
    $('#readMoreBtn1').click(function(){
        $('#moreContent1').toggle('slow');
    });
    
    $('#readMoreBtn2').click(function(){
        $('#moreContent2').toggle('slow');
    });
    
    $('#readMoreBtn3').click(function(){
        $('#moreContent3').toggle('slow', function() {
            if ($('#moreContent3').is(':visible')) {
                $('html, body').animate({
                    scrollTop: $('#moreContent3').offset().top - 100 // Adjust as needed
                }, 'slow');
            }
        });
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