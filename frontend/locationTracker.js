let userLocation = { lat: 0, lng: 0 };  // User's current location
const safeLocation = { lat: 40.7128, lng: -74.0060 };  // Example: User's home (Latitude, Longitude)
const radius = 0.5;  // Safe radius in kilometers (500 meters)

// Function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

// Function to simulate user location for testing (use actual GPS for real-world usage)
function simulateUserLocation(lat, lng) {
    userLocation.lat = lat;
    userLocation.lng = lng;

    console.log("Simulated User's Location:", userLocation);

    // Check if the user is within the safe zone
    checkIfInsideRadius(userLocation);
}

// Function to check if the user is inside the safe radius
function checkIfInsideRadius(userLocation) {
    let distance = calculateDistance(userLocation.lat, userLocation.lng, safeLocation.lat, safeLocation.lng);
    console.log("Distance from safe location:", distance, "km");

    // If the user is outside the safe radius, send a notification
    if (distance > radius) {
        console.log("User is outside the safe radius. Sending notification...");
        sendNotification();
    }
}

// Placeholder function for sending a notification (e.g., call 911 or notify someone)
function sendNotification() {
    alert("User has wandered outside the safe radius. Please call 911!");
    // You can integrate with a service like Twilio or Firebase to send real notifications (email, SMS, etc.)
}

// Initialize the map (optional visualization of the radius)
function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: safeLocation,
        zoom: 15
    });

    // Create a circle (safe zone) on the map
    const safeZoneCircle = new google.maps.Circle({
        map: map,
        center: safeLocation,
        radius: radius * 1000, // Radius in meters
        fillColor: "#FF0000",
        fillOpacity: 0.1,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2
    });

    // Create a marker at the safe location (home)
    const marker = new google.maps.Marker({
        position: safeLocation,
        map: map,
        title: "Safe Zone Center"
    });

    // Simulate test data (change these coordinates to test different scenarios)
    // Test Case 1: User is inside the safe zone
    simulateUserLocation(40.7138, -74.0050); // Near the safe location

    // Test Case 2: User is outside the safe zone (after 5 seconds)
    setTimeout(() => simulateUserLocation(40.7300, -73.9350), 5000); // Far away from the safe location (testing after 5 seconds)
}
