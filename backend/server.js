const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const geolib = require('geolib');
const TeleSignSDK = require('telesignsdk');


const app = express();


// Enable CORS to allow the frontend to make requests to this server
app.use(cors());



// Replace the defaults below with your Telesign authentication credentials or pull them from environment variables.
const customerId =
  process.env.CUSTOMER_ID || "BDB69E86-9DB9-4EA1-B9F1-029640C7A68C";
const apiKey =
  process.env.API_KEY ||
  "ABC12345yusumoN6BYsBVkh+yRJ5czgsnCehZaOYldPJdmFh6NeX8kunZ2zU1YWaUw/0wV6xfw==";

// Set the default below to your test phone number or pull it from an environment variable.
// In your production code, update the phone number dynamically for each transaction.
const phoneNumber = process.env.PHONE_NUMBER || "18472816611";
//parameters.senderId = process.env.SENDER_ID "11234567891";


// Instantiate a messaging client object.


// Connect to MongoDB
mongoose.connect(
  'mongodb+srv://mykelxu:RiceCream124!@parkinsonsdata.5iolr.mongodb.net/locationTracker?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Define a Mongoose schema for the location data
const locationSchema = new mongoose.Schema({
  user_id: String,
  name: String,
  location: {
    lat: Number,
    lng: Number,
  },
  radius: { type: Number, default: 500 }, // Radius in meters (default: 500m)
  phoneNumber: String, // Store the user's phone number for SMS alerts
  timestamp: Date,
  device: String,
  note: String,
});

// Create a Mongoose model for locations
const Location = mongoose.model('Location', locationSchema);

// Function to send SMS alerts using Telesign SDK
const sendAlert = async ( name) => {
  const message = `Alert: ${name} has wandered outside their safe radius!`;
  const messageType = "ARN";  // This is an alert message
  const parameters = {};
  const client = new TeleSignSDK(customerId, apiKey);

  console.log(customerId, apiKey);

  // Define the callback for handling the response
  function smsCallback(error, responseBody) {
    if (error === null) {
      console.log("Response body:" + JSON.stringify(responseBody));
    } else {
      console.error("Unable to send SMS. Error:" + error);
    }
  }

  // Make the request and capture the response
  client.sms.message(smsCallback, phoneNumber, message, messageType, {});
};

// Update all users with a default phone number and radius
const updateUsers = async () => {
  try {
    const result = await Location.updateMany(
      { phoneNumber: { $exists: false } }, // Users who don't have a phoneNumber
      { $set: { phoneNumber: '+18472816611', radius: 500 } } // Set phone number and default radius
    );
    console.log(`Updated ${result.nModified} users with a default phone number and radius.`);
  } catch (error) {
    console.error('Error updating users:', error);
  }
};

// Run the update function
updateUsers();

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

// Endpoint to get a user's location by their name
let initialPositions = {}; // Store first seen positions

app.get('/get-location', async (req, res) => {
  const { name } = req.query;

  try {
      const user = await Location.findOne({ name });

      if (user) {
          if (!initialPositions[name]) {
              initialPositions[name] = { lat: user.location.lat, lng: user.location.lng };
          }

          // **Check if user moved outside their radius**
          const isOutOfBounds = !geolib.isPointWithinRadius(
              user.location, // Current stored location
              initialPositions[name], // Original location
              user.radius // Allowed radius
          );

          if (isOutOfBounds && user.phoneNumber) {
              await sendAlert(user.phoneNumber, user.name);
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
