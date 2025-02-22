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
                openLocation(rowData.process);
            });
            cell.appendChild(button);
        } else {
            cell.textContent = value;
        }
        row.appendChild(cell);
    });
    tableBody.appendChild(row);
});

function openLocation(process) {
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
            <style>
                #map {
                    width: 100%;
                    height: 100vh;
                    border: 2px solid black;
                }
            </style>
        </head>
        <body> 
            <div id="map"></div>
            
            <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB5nXmXgfKvakxNr6hTwO-CzHbGrK-3qno"></script>
            <script>
                let map;

                function initMap() {
                    console.log("initMap called");
                    map = new google.maps.Map(document.getElementById("map"), {
                        center: { lat: 40.7128, lng: -74.0060 },
                        zoom: 15
                    });
                    getLocation();
                }

                function getLocation() {
                    console.log("getLocation called");
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                const lat = position.coords.latitude;
                                const lng = position.coords.longitude;
                                console.log("Latitude: " + lat + ", Longitude: " + lng);
                                showLocationOnMap(lat, lng);
                            },
                            () => {
                                alert("Geolocation failed.");
                            }
                        );
                    } else {
                        alert("Geolocation not supported.");
                    }
                }

                function showLocationOnMap(lat, lng) {
                    console.log("showLocationOnMap called with lat: " + lat + ", lng: " + lng);
                    const userLocation = { lat: lat, lng: lng };
                    map.setCenter(userLocation);

                    new google.maps.Marker({
                        position: userLocation,
                        map: map,
                        title: "You are here!"
                    });

                    new google.maps.Circle({
                        map: map,
                        radius: 1000,
                        fillColor: '#FF0000',
                        fillOpacity: 0.35,
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        center: userLocation
                    });
                }

                window.onload = initMap;
            </script>
        </body>
        </html>
    `);

    newWindow.document.close();
}