// const axios = require('axios');
// const mongoose = require('mongoose');
// const TeleSignSDK = require("telesignsdk");

// // MongoDB Connection
// const mongoUri = "mongodb+srv://samuelc:DataScience123@falldb.ar6mh.mongodb.net/?retryWrites=true&w=majority&appName=fallDB";
// mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log("MongoDB connected"))
//     .catch(err => console.error("MongoDB connection error:", err));

// // Define Mongoose Schema to Get User Phone Numbers
// const userSchema = new mongoose.Schema({
//     name: String,
//     phoneNumber: String
// });
// const User = mongoose.model('User', userSchema, 'people'); // Map to 'people' collection

// // TeleSign API Credentials
// const customerId = "BDB69E86-9DB9-4EA1-B9F1-029640C7A68C"; 
// const apiKey = "LeNRpMiOTEuNPWskahS0LaOQBlNszSDjBti7PEBV2cFgsiQGWw3yFxgD0OCtaZPKgoITd6gHeoSXI1hPXu5qdw==";
// const client = new TeleSignSDK(customerId, apiKey);

// // Function to send SMS alerts
// const sendAlert = (userPhoneNumber, name) => {
//     const message = `ALERT: ${name} has experienced a fall. Please check on them immediately!`;
//     const messageType = "ARN"; // Alert message type

//     function smsCallback(error, responseBody) {
//         if (!error) {
//             console.log(`SMS sent to ${userPhoneNumber}: ${message}`);
//         } else {
//             console.error("Error sending SMS:", error);
//         }
//     }

//     client.sms.message(smsCallback, userPhoneNumber, message, messageType, {});
// };

// // Fetch fall detection results from Flask API
// const checkFalls = async () => {
//     try {
//         const response = await axios.get('http://localhost:5001/predict_all'); // Ensure Flask is running
//         const fallResults = response.data; // List of [name, fall_rate] pairs

//         for (let i = 0; i < fallResults.length; i += 2) {
//             const name = fallResults[i];
//             const fallRate = fallResults[i + 1];

//             if (fallRate === 1) {
//                 console.log(`${name} has fallen! Sending alert...`);
                
//                 // Find user's phone number in MongoDB
//                 const user = await User.findOne({ name });
//                 if (user && user.phoneNumber) {
//                     sendAlert(user.phoneNumber, name);
//                 } else {
//                     console.error(`Phone number for ${name} not found.`);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error("Error fetching fall data:", error);
//     }
// };

// // Check for falls every minute
// setInterval(checkFalls, 60000);
// const TelesignSDK = require('telesignsdk');
// const fetch = require('node-fetch');  // Make sure to install node-fetch if you're using Node.js

// // Telesign credentials
// const customerId = 'YOUR_TELESIGN_CUSTOMER_ID';
// const apiKey = 'YOUR_TELESIGN_API_KEY';
// const senderPhoneNumber = 'YOUR_TELSIGN_PHONE_NUMBER';  // Your Telesign number for sending messages

// // Create Telesign SDK client
// const telesign = new TelesignSDK(customerId, apiKey);
// const messaging = telesign.messaging;

// // Function to send SMS via Telesign
// function sendSMS(phoneNumber, message) {
//   const params = {
//     to: phoneNumber,
//     message: message,
//     message_type: 'ARN',  // 'ARN' is used for alert type
//   };

//   messaging.message(params, function (err, responseBody) {
//     if (err) {
//       console.error('Error sending message:', err);
//     } else {
//       console.log(`Alert sent to ${phoneNumber}: ${message}`);
//     }
//   });
// }

// // Function to check for falls in the JSON response
// async function checkForFalls() {
//   try {
//     // Fetch data from the Flask app (you can change the URL if your Flask app is deployed somewhere else)
//     const response = await fetch('http://localhost:5001/predict_all');
//     const data = await response.json();

//     // Loop through the data to check if any fall is detected
//     for (const [name, [fallRate, phoneNumber]] of Object.entries(data)) {
//       if (fallRate === 1) {
//         const message = `${name} has experienced a fall! Please check on them.`;
//         console.log(`Sending message to ${phoneNumber}...`);
//         sendSMS(phoneNumber, message);  // Send SMS using Telesign
//       }
//     }
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
// }

// // Check for falls every minute
// setInterval(checkForFalls, 60000);  // 60000 ms = 1 minute

const axios = require('axios');
const TeleSignSDK = require("telesignsdk");

// TeleSign API Credentials
const customerId = "BDB69E86-9DB9-4EA1-B9F1-029640C7A68C"; 
const apiKey = "LeNRpMiOTEuNPWskahS0LaOQBlNszSDjBti7PEBV2cFgsiQGWw3yFxgD0OCtaZPKgoITd6gHeoSXI1hPXu5qdw==";
const client = new TeleSignSDK(customerId, apiKey);

// Function to send SMS alerts
const sendAlert = (userPhoneNumber, name) => {
    const message = `ALERT: ${name} has experienced a fall. Please check on them immediately!`;
    const messageType = "ARN"; // Alert message type

    function smsCallback(error, responseBody) {
        if (!error) {
            console.log(`SMS sent to ${userPhoneNumber}: ${message}`);
        } else {
            console.error("Error sending SMS:", error);
        }
    }

    client.sms.message(smsCallback, userPhoneNumber, message, messageType, {});
};

// Fetch fall detection results from Flask API
const checkFalls = async () => {
    try {
        const response = await axios.get('http://localhost:5001/predict_all'); // Ensure Flask is running
        const fallResults = response.data; // Object with names as keys and fall rates & phone numbers as values

        for (const [name, [fallRate, phoneNumber]] of Object.entries(fallResults)) {
            if (fallRate === 1) {
                console.log(`${name} has fallen! Sending alert...`);

                if (phoneNumber) {
                    sendAlert(phoneNumber, name);
                } else {
                    console.error(`Phone number for ${name} not found.`);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching fall data:", error);
    }
};

checkFalls();  // Check for falls immediately
// Check for falls every minute
setInterval(checkFalls, 60000);
