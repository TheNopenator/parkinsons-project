const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TeleSignSDK = require("telesignsdk");
const axios = require('axios');  // Add axios for making HTTP requests

const app = express();

// Enable CORS to allow the frontend to make requests to this server
app.use(cors());

// Connect to MongoDB
const uri = 'mongodb+srv://samuelc:DataScience123@falldb.ar6mh.mongodb.net/fall?retryWrites=true&w=majority&appName=fallDB';  // Your MongoDB URI, with 'fall' as the database name
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Define a schema for the heartbeat data
const heartbeatSchema = new mongoose.Schema({
    user_id: { type: String, required: true },    // user_id as String
    name: { type: String, required: true },        // name as String
    acc_max: { type: Number, required: true },     // acc_max as a Number (Double)
    gyro_max: { type: Number, required: true },    // gyro_max as a Number (Double)
    lin_max: { type: Number, required: true },     // lin_max as a Number (Double)
    post_gyro_max: { type: Number, required: true }, // post_gyro_max as a Number (Double)
    post_lin_max: { type: Number, required: true }, // post_lin_max as a Number (Double)
    phoneNumber: { type: String, required: true },  // phoneNumber as String
    heartbeat: { type: Number, required: true },   // heartbeat as Number (Long)
    timestamp: { type: Date, default: Date.now }   // timestamp as Date, with default to current time
});
  
// Create the Mongoose model
const Heartbeat = mongoose.model('Heartbeat', heartbeatSchema, 'people');  // 'people' is the collection name in the 'fall' database

let SMSSentBool = false;

// Function to send an SMS alert
const sendAlert = async (userPhoneNumber, name, heartbeat) => {
  const customerId = "BDB69E86-9DB9-4EA1-B9F1-029640C7A68C";  // Your customer ID
  const apiKey = "LeNRpMiOTEuNPWskahS0LaOQBlNszSDjBti7PEBV2cFgsiQGWw3yFxgD0OCtaZPKgoITd6gHeoSXI1hPXu5qdw==";  // Your API key
  
  // Format the message the same way as the console log
  const message = `${name} has a heart rate of ${heartbeat} beats per minute. This may indicate abnormal behavior. Please check on them.`;

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

// Function to check heartbeat and send alerts
const checkHeartbeats = async () => {
  const users = await Heartbeat.find();  // Get all users from the database

  for (let user of users) {
    const currentHeartbeat = user.heartbeat;

    // Check if the heartbeat is outside of a normal range (e.g., between 60 and 100 bpm)
    if (currentHeartbeat < 60 || currentHeartbeat > 100) {
      if (user.phoneNumber && SMSSentBool == false) {
        console.log(`${user.name} has abnormal heartbeat: ${currentHeartbeat} bpm`);
        sendAlert(user.phoneNumber, user.name, currentHeartbeat);  // Send alert message
        SMSSentBool = true;
      }
    }
  }
};

// Randomly update the user's heartbeat every 5 seconds for all users in the database
setInterval(async () => {
  const users = await Heartbeat.find();  // Get all users from the database

  for (let user of users) {
    const newHeartbeat = Math.round(65 + Math.random() * 15);  // Randomly update heartbeat within a reasonable range (60-100 bpm), and round to nearest integer
    // Update the user's heartbeat in the MongoDB database
    await Heartbeat.updateOne(
      { user_id: user.user_id },  // Match user by their user_id
      { 
        heartbeat: newHeartbeat, 
        timestamp: new Date() 
      }
    );

    console.log(`Updated ${user.name}'s heartbeat to: ${newHeartbeat} bpm`);
  }
}, 5000);  // Update every 5 seconds

// Endpoint to get a user's heartbeat by their name
app.get('/get-heartbeat', async (req, res) => {
    const { name } = req.query;
    console.log(`Received request to get heartbeat for: ${name}`);
  
    try {
      const user = await Heartbeat.findOne({ name });
      if (user) {
        console.log("Fetched user data:", user);  // Log data for debugging
        res.json({
          message: `Heartbeat for ${name}:`,
          heartbeat: user.heartbeat,
          timestamp: user.timestamp,
        });
      } else {
        console.log("No user found for:", name);
        res.status(404).json({ message: `No data found for ${name}.` });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// Start the server on port 5005
const PORT = 5005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});