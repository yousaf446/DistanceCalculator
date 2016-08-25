var map;
var map_center = new google.maps.LatLng(0,0);
function initialize() {
    var mapOptions = {
        center: map_center,
        zoom: 1,
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);