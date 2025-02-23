// Initializes the front page's table
const tableData = [
    { process: 'Current Location', name: 'John Doe', last_called: 'Never'},
    { process: 'Health Status', name: 'John Doe', last_called: 'Never'},
    { process: 'Current Location', name: 'Jane Smith', last_called: 'Never'},
    { process: 'Health Status', name: 'Jane Smith', last_called: 'Never'},
    { process: 'Current Location', name: 'Bob Johnson', last_called: 'Never'},
    { process: 'Health Status', name: 'Bob Johnson', last_called: 'Never'},
    { process: 'Current Location', name: 'Alice Brown', last_called: 'Never'},
    { process: 'Health Status', name: 'Alice Brown', last_called: 'Never'},
    { process: 'Current Location', name: 'Charlie Wilson', last_called: 'Never'},
    { process: 'Health Status', name: 'Charlie Wilson', last_called: 'Never'},
    { process: 'Current Location', name: 'Daniel Green', last_called: 'Never'},
    { process: 'Health Status', name: 'Daniel Green', last_called: 'Never'}
]

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

tableData.forEach(rowData => {
    const row = document.createElement('tr');
    Object.entries(rowData).forEach(([key, value]) => {
        const cell = document.createElement('td');
        if (key === 'process') {
            const button = document.createElement('button');
            button.textContent = value;
            button.addEventListener('click', () => {
                openLocation(rowData.name, rowData.process);
            });
            cell.appendChild(button);
        } else {
            cell.textContent = value;
        }
        row.appendChild(cell);
    });
    tableBody.appendChild(row);
});

function openLocation(name, process) {
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
                const name = '${name}';
                const process = '${process}';

                function initMap() {
                    console.log("initMap called");
                    map = new google.maps.Map(document.getElementById("map"), {
                        center: { lat: 40.7128, lng: -74.0060 },
                        zoom: 15
                    });
                    getLocation();
                }

                async function getLocation() {
                    try {
                        const response = await fetch('http://localhost:5000/get-location?name=' + encodeURIComponent(name));
                        const data = await response.json();

                        if (response.ok) {
                            const lat = data.latitude;
                            const lng = data.longitude;
                            showLocationOnMap(lat, lng);
                        } else {
                            alert(data.message || "Error fetching user location.");
                        }
                    } catch (error) {
                        alert("Error fetching location: " + error.message);
                    }
                }

                function showLocationOnMap(lat, lng) {
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

                function displayUserInfo() {
                    document.body.innerHTML += "<h1>" + process + " for " + name + "</h1>";
                    document.body.innerHTML += "<p>Last updated: " + new Date().toLocaleTimeString() + "</p>";
                }

                window.onload = initMap;
            </script>
        </body>
        </html>
    `);

    newWindow.document.close();
}