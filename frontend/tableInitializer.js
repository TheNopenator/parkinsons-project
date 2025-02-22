// Initializes the front page's table
const tableData = [
    { process: 'Current Location', status: 'Running', started: '0 seconds ago'}
]

const tableBody = document.querySelector('#active-processes tbody');

tableData.forEach(rowData => {
    const row = document.createElement('tr');
    Object.entries(rowData).forEach(([key, value]) => {
        const cell = document.createElement('td');
        if (key === 'process') {
            const button = document.createElement('button');
            button.textContent = value;
            button.addEventListener('click', () => {
                openLocation(rowData.name);
            });
            cell.appendChild(button);
        } else {
            cell.textContent = value;
        }
        row.appendChild(cell);
    });
    tableBody.appendChild(row);
});

function openLocation(name) {
    const width = 1000;
    const height = 750;
    const left = ((screen.width / 2) - (width / 2));
    const top = ((screen.height / 2) - (height / 2));
    const newWindow = window.open("", "locationWindow", `width=${width},height=${height},left=${left},top=${top}`);
    newWindow.document.open();
    newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Location</title>
            <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB5nXmXgfKvakxNr6hTwO-CzHbGrK-3qno&callback=initMap"></script>
        </head>
        <body> 
            <div id="map" style="height: 100%; width: 100%;"></div>
            <script>
                let map;  // Global map variable

                // Initialize the map
                function initMap() {
                    console.log("initMap called");
                    map = new google.maps.Map(document.getElementById("map"), {
                        center: { lat: 40.7128, lng: -74.0060 },  // Default to New York (for initial load)
                        zoom: 15
                    });
                    getLocation();
                }

                function getLocation() {
                    console.log("getLocation called");
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
                    console.log("showLocationOnMap called with lat: " + lat + ", lng: " + lng);
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

                window.initMap = initMap;
                window.onload = initMap;
            </script>
        </body>
        </html>
    `);

    newWindow.document.close();
}