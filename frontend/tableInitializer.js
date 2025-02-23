const tableData = [
    { process: 'Current Location', name: 'John Doe', last_called: 'Never' },
    { process: 'Health Status', name: 'John Doe', last_called: 'Never' },
    { process: 'Current Location', name: 'Jane Smith', last_called: 'Never' },
    { process: 'Health Status', name: 'Jane Smith', last_called: 'Never' },
    { process: 'Current Location', name: 'Bob Johnson', last_called: 'Never' },
    { process: 'Health Status', name: 'Bob Johnson', last_called: 'Never' },
    { process: 'Current Location', name: 'Alice Brown', last_called: 'Never' },
    { process: 'Health Status', name: 'Alice Brown', last_called: 'Never' },
    { process: 'Current Location', name: 'Charlie Wilson', last_called: 'Never' },
    { process: 'Health Status', name: 'Charlie Wilson', last_called: 'Never' },
    { process: 'Current Location', name: 'Daniel Green', last_called: 'Never' },
    { process: 'Health Status', name: 'Daniel Green', last_called: 'Never' }
];

const tableBody = document.querySelector('#active-processes tbody');

function updateLastCalled(index) {
    const currentTime = new Date().toLocaleTimeString();
    tableData[index].last_called = `${currentTime}`;
    renderTable();
}

function renderTable() {
    tableBody.innerHTML = '';
    tableData.forEach((rowData, index) => {
        const row = document.createElement('tr');
        Object.entries(rowData).forEach(([key, value]) => {
            const cell = document.createElement('td');
            if (key === 'process') {
                const button = document.createElement('button');
                button.textContent = value;
                button.addEventListener('click', () => {
                    openLocation(rowData.name, rowData.process);
                    updateLastCalled(index);
                });
                cell.appendChild(button);
            } else {
                cell.textContent = value;
            }
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    });
}

renderTable();

function openLocation(name, process) {
    const width = 1000;
    const height = 750;
    const left = ((screen.width / 2) - (width / 2));
    const top = ((screen.height / 2) - (height / 2));
    const newWindow = window.open("", "locationWindow", `width=${width},height=${height},left=${left},top=${top}`);

    const locationData = { name, process };
    newWindow.locationData = locationData;

    newWindow.document.open();
    newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <link rel="stylesheet" href="styles.css">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Get User Location</title>
            <style>
                #map {
                    width: 100%;
                    height: 100vh;
                    border: 2px solid black;
                }
                .health-status {
                    text-align: center;
                    margin-top: 20px;
                }
                .health-status img {
                    width: 200px;
                    height: 200px;
                }
            </style>
            <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB5nXmXgfKvakxNr6hTwO-CzHbGrK-3qno&callback=initMap" async defer></script>
        </head>
        <body>
            <h1>${name}</h1>
            <div id="location"></div>
            <div id="map"></div>

            <script>
                let map, marker, circle, line;
                let locationInterval;

                window.onload = function() {
                    if ("${process}" === "Current Location") {
                        // Initialize and show map
                        map = new google.maps.Map(document.getElementById("map"), {
                            center: { lat: 40.7128, lng: -74.0060 },
                            zoom: 15
                        });
                        startUpdatingLocation();
                    } else if ("${process}" === "Health Status") {
                        // Hide map and show health status with heart image
                        document.getElementById("map").style.display = "none";
                        document.getElementById("location").innerHTML = \`
                            <div class="health-status">
                                <img src="images/heart-removebg-preview.png" alt="A heart icon containing the user's heart rate" />
                                <h3>User's Heartbeat</h3>
                                <p class="bpm" style='color: #FFF; position: fixed; top: 175px; left: 420px;'>HR: 72 BPM</p>
                                <p style='color: #FFF;'>Last Updated: \${new Date().toLocaleString()}</p>
                            </div>
                        \`;
                    }
                };

                async function getLocation() {
                    const name = "${name}";

                    try {
                        const response = await fetch(\`https://locusqol.tech/get-location?name=${encodeURIComponent(name)}\`, {
                            cache: 'no-cache',
                        });

                        const data = await response.json();

                        if (response.ok) {
                            document.getElementById("location").innerHTML = \`
                                <div class="geography">
                                    <p>Latitude: \${data.location.lat}</p>
                                    <p>Longitude: \${data.location.lng}</p>
                                    <p>Radius: \${data.radius} meters</p>
                                    <p>Last Updated: \${new Date(data.timestamp).toLocaleString()}</p>
                                </div>
                            \`;

                            const position = { lat: data.location.lat, lng: data.location.lng };

                            if (!marker) {
                                marker = new google.maps.Marker({
                                    map,
                                    position: position,
                                    title: name,
                                });
                            } else {
                                marker.setPosition(position);
                            }

                            if (!circle) {
                                circle = new google.maps.Circle({
                                    strokeColor: "#0000FF",
                                    strokeOpacity: 0.8,
                                    strokeWeight: 2,
                                    fillColor: "#0000FF",
                                    fillOpacity: 0.35,
                                    map,
                                    center: position,
                                    radius: data.radius,
                                });
                            }

                            if (line) {
                                line.setPath([circle.getCenter(), marker.getPosition()]);
                            } else {
                                line = new google.maps.Polyline({
                                    strokeColor: "#0000FF",
                                    strokeOpacity: 1.0,
                                    strokeWeight: 2,
                                    map: map,
                                    path: [circle.getCenter(), marker.getPosition()],
                                    icons: [{
                                        icon: {
                                            path: 'M 0,-1 0,1',
                                            strokeOpacity: 1,
                                            scale: 4,
                                        },
                                        offset: '0',
                                        repeat: '10px'
                                    }],
                                });
                            }

                            map.setCenter(position);
                            map.setZoom(15);
                        } else {
                            document.getElementById("location").innerHTML = \`<p>\${data.message}</p>\`;
                        }
                    } catch (error) {
                        document.getElementById("location").innerHTML = \`<p>Error: \${error.message}</p>\`;
                    }
                }

                function startUpdatingLocation() {
                    getLocation();
                    locationInterval = setInterval(getLocation, 5000);
                }

                function stopUpdatingLocation() {
                    clearInterval(locationInterval);
                }
            </script>
        </body>
        </html>
    `);
    newWindow.document.close();
}
