var map;
var map_center = new google.maps.LatLng(0,0);
var markers = [];
var middlePoints = [];
var circles = [];
var mark_counter = 0;
var distancePath = new google.maps.Polyline({
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
});
var toggle = false;

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

    speedRange();
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

        createNewMarker(event, 'simple');
    });
}

function createNewMarker(event, type, order) {

    circles[mark_counter] = new google.maps.Marker({
        position: event.latLng,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 4,
            strokeColor: '#F896B8'

        },
        draggable: true,
        map: map,
        id: mark_counter,
        status: true
    });

    markers[mark_counter] = new google.maps.Marker({
        position: event.latLng,
        icon: mark_image,
        draggable: true,
        map: map,
        id: mark_counter,
        status: true
    });

    google.maps.event.addListener(circles[mark_counter], 'dragend', function(event) {

        moveMarkers(this.id, event)
    });

    google.maps.event.addListener(markers[mark_counter], 'dragend', function(event) {

        moveMarkers(this.id, event)
    });

    if(mark_counter > 0) {
        if(type == 'simple') {
            var midDistanceLatLng = findMiddlePoint(markers[mark_counter - 1].getPosition(), markers[mark_counter].getPosition());
            plotMiddlePoint(midDistanceLatLng, mark_counter - 1, mark_counter);
        } else {
                var midDistanceLatLng = findMiddlePoint(markers[type].getPosition(), markers[mark_counter].getPosition());
                plotMiddlePoint(midDistanceLatLng, type, mark_counter);
        }
    }

    calculatePath();

    mark_counter++;
}

function createNewMarkerWithMiddle(middlePoint, event) {
    createNewMarker(event, middlePoint.p1, 'first');
    createNewMarker(event, middlePoint.p2, 'second');

}

function moveMarkers(mark, event) {
    circles[mark].setPosition(event.latLng);
    markers[mark].setPosition(event.latLng);
}

function calculatePath() {
    var pathCoordinates = [];
    for (var i = 0; i < markers.length; i++) {
        pathCoordinates.push(markers[i].getPosition());
    }
    distancePath.setPath(pathCoordinates);
    distancePath.setMap(map);
    calculateDistance();
}

function findMiddlePoint(p1, p2) {
    return google.maps.geometry.spherical.interpolate(p1, p2, 0.5);

}

function plotMiddlePoint(middleLatLng, mark1, mark2) {
    middlePoints[mark1] = new google.maps.Marker({
        position: middleLatLng,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 4,
            strokeColor: '#F896B8'

        },
        draggable: true,
        map: map,
        id: mark1,
        p1: mark1,
        p2: mark2
    });

    google.maps.event.addListener(middlePoints[mark1], 'dragend', function(event) {

        //createNewMarkerWithMiddle(this, event);
    });
}

function calculateDistance() {
    var polylineLength = 0;
    if (markers.length > 0) polylineLength += google.maps.geometry.spherical.computeLength(distancePath.getPath());
    if($("#dist_km").is(":checked")) {
        polylineLength = polylineLength / 1000;
    } else if($("#dist_miles").is(":checked")) {
        polylineLength = polylineLength * 0.00062137;
    }
    polylineLength = parseFloat(polylineLength).toFixed(2);
    $("#tdist").val(polylineLength);
}

function clearLast() {
    markers[markers.length-1].setMap(null);
    delete markers[markers.length-1];
    markers.length--;
    circles[circles.length-1].setMap(null);
    delete circles[circles.length-1];
    circles.length--;
    mark_counter--;
    middlePoints[middlePoints.length-1].setMap(null);
    calculatePath();
}

function zoomToFit() {
    var bounds = new google.maps.LatLngBounds();
    for(var i in markers) {
        bounds.extend(markers[i].getPosition());
    }
    map.fitBounds(bounds);
}

function clearMap() {
    for(var i in markers) {
        markers[i].setMap(null);
    }

    for(var i in circles) {
        circles[i].setMap(null);
    }

    for(var i in middlePoints) {
        middlePoints[i].setMap(null);
    }

    mark_counter  = 0;
    markers.length = 0;
    circles.length = 0;
    middlePoints.length = 0;
    distancePath.setMap(null);
    $("#tdist").val(0);
}

function toggleMarkers() {
    for(var i in markers) {
        markers[i].setVisible(toggle);
    }

    toggle = !toggle;
}

function speedRange() {
    $( document ).ready(function() {
        $( "#speed_range" ).slider({
            range: "max",
            min: 0,
            max: 100,
            value: 2,
            slide: function( event, ui ) {
                $( "#speed_meter" ).val( ui.value );
            }
        });
        $( "#speed_meter" ).val( $( "#speed_range" ).slider( "value" ) );
    });
}




google.maps.event.addDomListener(window, 'load', initialize);