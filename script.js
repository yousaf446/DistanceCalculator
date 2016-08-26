var map;
var map_center = new google.maps.LatLng(0,0);
var markers = [];
var circles = [];
var mark_counter = 0;

var mark_image = new google.maps.MarkerImage(
    "images/marker.png",
    null, /* size is determined at runtime */
    null, /* origin is 0,0 */
    null, /* anchor is bottom center of the scaled image */
    new google.maps.Size(32, 32)
);

function initialize() {
    var mapOptions = {
        center: map_center,
        zoom: 1,
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    mapEvents();
}

function setMapHeight(height) {

    if(height == 'small') {
        $('.map-div').css("height","300px");
        google.maps.event.trigger(map, 'resize');
    } else if(height == 'medium') {
        $('.map-div').css("height","400px");
        google.maps.event.trigger(map, 'resize');
    } else if(height == 'large') {
        $('.map-div').css("height","500px");
        google.maps.event.trigger(map, 'resize');
    } else if(height == 'full') {
    }
}

function mapEvents() {

    google.maps.event.addListener(map, 'click', function(event) {

        createNewMarker(event);
    });
}

function createNewMarker(event) {

    circles[mark_counter] = new google.maps.Marker({
        position: event.latLng,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 4,
            strokeColor: '#F896B8'

        },
        draggable: true,
        map: map,
        id: mark_counter
    });

    markers[mark_counter] = new google.maps.Marker({
        position: event.latLng,
        icon: mark_image,
        draggable: true,
        map: map,
        id: mark_counter
    });

    google.maps.event.addListener(circles[mark_counter], 'dragend', function(event) {

        moveMarkers(this.id, event)
    });

    google.maps.event.addListener(markers[mark_counter], 'dragend', function(event) {

        moveMarkers(this.id, event)
    });

    mark_counter++;
}

function moveMarkers(mark, event) {
    circles[mark].setPosition(event.latLng);
    markers[mark].setPosition(event.latLng);
}


google.maps.event.addDomListener(window, 'load', initialize);