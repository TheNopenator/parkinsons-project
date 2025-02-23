const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const geolib = require('geolib');
const TeleSignSDK = require("telesignsdk");
const axios = require('axios');  // Add axios for making HTTP requests

const app = express();

// Enable CORS to allow the frontend to make requests to this server
app.use(cors());

// Connect to MongoDB
mongoose.connect(
  'mongodb+srv://mykelxu:RiceCream124!@parkinsonsdata.5iolr.mongodb.net/locationTracker?retryWrites=true&w=majority',
  {
    serverSelectionTimeoutMS: 50000,  // 50 seconds for server selection timeout
    socketTimeoutMS: 50000,           // 50 seconds for socket timeout
  }
)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });


// Define a Mongoose schema for the location data
const locationSchema = new mongoose.Schema({
  user_id: String,
  name: String,
  location: {
    lat: Number,
    lng: Number,
  },
  radius: { type: Number, default: 500 }, // Radius in meters (default: 500m)
  timestamp: Date,
  phoneNumber: String, // Add phone number to trigger SMS alert
});

// Create a Mongoose model for locations
const Location = mongoose.model('Location', locationSchema);
let initialPositions = {}; 

// Function to send an SMS alert
const sendAlert = async (userPhoneNumber, name, lat, lng, address) => {
  const customerId = "BDB69E86-9DB9-4EA1-B9F1-029640C7A68C"; // Your customer ID
  const apiKey = "LeNRpMiOTEuNPWskahS0LaOQBlNszSDjBti7PEBV2cFgsiQGWw3yFxgD0OCtaZPKgoITd6gHeoSXI1hPXu5qdw=="; // Your API key
  
  // Format the message the same way as the console log
  const message = `${name} is currently outside of their normal everyday activity area (Latitude: ${lat}, Longitude: ${lng}). Address: ${address}. Please check on them as they may be experiencing confusion or disorientation.`;

  const messageType = "ARN";  // Alert message type
  
  const client = new TeleSignSDK(customerId, apiKey);

  // Logging the request to ensure function is being called
  console.log(`Sending SMS to ${userPhoneNumber}: ${message}`);

  function smsCallback(error, responseBody) {
    if (error === null) {
      console.log("SMS sent successfully. Response body: " + JSON.stringify(responseBody));
    } else {
      console.error("Error sending SMS: " + error);
      console.error("Response body: " + JSON.stringify(responseBody));
    }
  }

  // Make the API call
  client.sms.message(smsCallback, userPhoneNumber, message, messageType, {});
};

// Function to get address from coordinates using Google Maps Geocoding API
const getAddressFromCoordinates = async (lat, lng) => {
  const apiKey = 'AIzaSyB5nXmXgfKvakxNr6hTwO-CzHbGrK-3qno';  // Your Geocoding API key
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await axios.get(geocodeUrl);
    if (response.data.status === 'OK') {
      return response.data.results[0].formatted_address;  // Return the first result's address
    } else {
      return 'Address not found';
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'Error retrieving address';
  }
};

// Randomly update the user's location every 5 seconds for all users in the database
setInterval(async () => {
  const users = await Location.find();  // Get all users from the database

  for (let user of users) {
    const currentLat = user.location.lat + (Math.random() - 0.5) * 0.01;  // Randomly update latitude
    const currentLng = user.location.lng + (Math.random() - 0.5) * 0.01;  // Randomly update longitude
    const newLocation = { lat: currentLat, lng: currentLng };

    // Update the user's location in the MongoDB database
    await Location.updateOne(
      { user_id: user.user_id },  // Match user by their user_id
      { 
        location: newLocation, 
        timestamp: new Date() 
      }
    );

    console.log(`Updated ${user.name}'s location to: ${currentLat}, ${currentLng}`);
  }
}, 5000);  // Update every 5 seconds

SMSSentBool = false;
// Endpoint to get a user's location by their name
app.get('/get-location', async (req, res) => {
  const { name } = req.query;

  try {
      const user = await Location.findOne({ name });

      if (user) {
          if (!initialPositions[name]) {
              initialPositions[name] = { lat: user.location.lat, lng: user.location.lng };
          }

          // Check if user moved outside their radius
          const isOutOfBounds = !geolib.isPointWithinRadius(
              user.location, // Current stored location
              initialPositions[name], // Original location
              user.radius // Allowed radius
          );

          // If the user is out of bounds and has a phone number, and has not been sent a SMS before, send an SMS.
          // For large scaling likely the use of a ntp server or time to reset SMS alerts so they can be sent again in the future.
          if (isOutOfBounds && user.phoneNumber && SMSSentBool == false) {
            const address = await getAddressFromCoordinates(user.location.lat, user.location.lng);  // Get correct address from user's coordinates
            console.log(`${name} is currently outside of their normal everyday activity area (Latitude: ${user.location.lat}, Longitude: ${user.location.lng}). Address: ${address}. Please check on them as they may be experiencing confusion or disorientation.`);
            sendAlert(user.phoneNumber, user.name, user.location.lat, user.location.lng, address);  // Send correct address in SMS
            SMSSentBool = true;
          }

          res.json({
              message: `Location for ${name}:`,
              latitude: user.location.lat,
              longitude: user.location.lng,
              radius: user.radius,
              initialLatitude: initialPositions[name].lat,
              initialLongitude: initialPositions[name].lng,
              timestamp: user.timestamp,
              outOfBounds: isOutOfBounds,
          });
      } else {
          res.status(404).json({ message: `No data found for ${name}.` });
      }
  } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});