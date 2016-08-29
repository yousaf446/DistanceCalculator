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
    strokeWeight: 1
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

    var search = (document.getElementById('search'));
    var autocomplete = new google.maps.places.Autocomplete(search);
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }
        map.setCenter(place.geometry.location);
        map.setZoom(14);
    });

    var fullscreen = document.getElementById('fullscreen');
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(fullscreen);

    mapEvents();

    speedRange();
}

function showMyLoc() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
        setTimeout(function() {if(map_center == "") showIpPosition();}, 4000);
    } else {
        showIpPosition();
    }

}

function showIpPosition() {
    $.get("http://ipinfo.io", function(response) {
        ip_loc = response.loc;
        var aCenter = ip_loc.split(",");
        var map_center = new google.maps.LatLng(aCenter[0], aCenter[1]);
        map.setCenter(map_center);
        map.setZoom(14);
    }, "jsonp");
}
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
        case error.POSITION_UNAVAILABLE:
        case error.TIMEOUT:
        case error.UNKNOWN_ERROR:
            showIpPosition();
            break;
    }
}

function showPosition(position) {
    var map_center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    map.setCenter(map_center);
    map.setZoom(14);
}

function setMapHeight(height) {

    if(height == 'small') {
        $('#map').removeClass("fullscreen");
        $('#map').addClass("map-canvas");
        $("#exit").hide();
        $('.map-div').css("height","350px");
        google.maps.event.trigger(map, 'resize');
    } else if(height == 'medium') {
        $('#map').removeClass("fullscreen");
        $('#map').addClass("map-canvas");
        $("#exit").hide();
        $('.map-div').css("height","450px");
        google.maps.event.trigger(map, 'resize');
    } else if(height == 'large') {
        $('#map').removeClass("fullscreen");
        $('#map').addClass("map-canvas");
        $("#exit").hide();
        $('.map-div').css("height","600px");
        google.maps.event.trigger(map, 'resize');
    } else if(height == 'full') {
        $("#exit").show();
        $('#map').addClass("fullscreen");
        $('#map').removeClass("map-canvas");
        $('html, body').animate({ scrollTop: 0 }, 0);
        google.maps.event.trigger(map, 'resize');

    }
}

function exitFullScreen() {
    setMapHeight('small');
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

    calculateTime();

    mark_counter++;
}

function createNewMarkerWithMiddle(middlePoint, event) {
    createNewMarker(event, middlePoint.p1, 'first');
    createNewMarker(event, middlePoint.p2, 'second');

}

function moveMarkers(mark, event) {
    circles[mark].setPosition(event.latLng);
    markers[mark].setPosition(event.latLng);
    calculatePath();
    reDrawMiddlePoints(mark);
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
        //draggable: true,
        map: map,
        id: mark1,
        p1: mark1,
        p2: mark2
    });
}

function reDrawMiddlePoints(mark) {
    if(mark == 0) {
        var midDistanceLatLng = findMiddlePoint(markers[mark].getPosition(), markers[mark+1].getPosition());
        middlePoints[mark].setPosition(midDistanceLatLng);
    }else {
        for(var i = mark - 1; i <= mark ; i++) {
            var midDistanceLatLng = findMiddlePoint(markers[i].getPosition(), markers[i+1].getPosition());
            middlePoints[i].setPosition(midDistanceLatLng);
        }
    }
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
    calculateTime();
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
                calculateTime();
            }
        });
        $( "#speed_meter" ).val( $( "#speed_range" ).slider( "value" ) );
    });
}

function changeMode(value) {
    $( "#speed_range" ).slider("value", value);
    $( "#speed_meter" ).val( $( "#speed_range" ).slider( "value" ) );
    calculateTime();
}

function calculateTime() {
    var time = convertTime();
    var unit = $("#time_unit").val();
    var content = "This would take " + time + " " + unit + " to travel";
    $("#time_text").html(content);
}

function convertTime() {
    var dist = parseFloat($( "#tdist" ).val());
    var speed = parseFloat($( "#speed_meter" ).val());

    if($("#dist_km").is(":checked")) {
        dist = dist * 0.62137;
    }

    var time = (dist / speed);
    var unit = $("#time_unit").val();

    if(unit == "minutes") {
        time = time * 60;
    } else if(unit == "days") {
        time = time / 24;
    }

    time = parseFloat(time).toFixed(2);

    return time;

}

google.maps.event.addDomListener(window, 'load', initialize);