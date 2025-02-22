let map;  // Global map variable

// Initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 40.7128, lng: -74.0060 },  // Default to New York (for initial load)
        zoom: 15
    });
}

function getLocation() {
    // Use the Geolocation API to get the current position
    fetch('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyB5nXmXgfKvakxNr6hTwO-CzHbGrK-3qno', {
        method: 'POST',
    })
        .then(response => response.json())
        .then(data => {
            let lat = data.location.lat;
            let lng = data.location.lng;

            console.log("Latitude: " + lat + ", Longitude: " + lng);

            // Update the map with the new location
            showLocationOnMap(lat, lng);
        })
        .catch(error => {
            console.error("Error with Geolocation API:", error);
            alert("Error retrieving location.");
        });
}


// Show location on map
function showLocationOnMap(lat, lng) {
    let userLocation = { lat: lat, lng: lng };

    // Center the map to the user's location
    map.setCenter(userLocation);

    // Add a marker at the user's location
    new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "You are here!"
    });

    // Optionally, add a circle around the location for visual effect
    let circle = new google.maps.Circle({
        map: map,
        radius: 1000,  // 1000 meters (1 km)
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        center: userLocation
    });
}
