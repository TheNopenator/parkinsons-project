const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const TeleSignSDK = require("telesignsdk");

const app = express();
app.use(cors());

app.get('/fall-status/:name', async (req, res) => {
    const name = req.params.name;
    try {
        const fallStatus = await getFallStatus(name);
        res.json({ fallStatus });
    } catch (error) {
        console.error("Error fetching fall status:", error);
        res.status(500).json({ error: "Failed to fetch fall status" });
    }
});


// TeleSign API Credentials
const customerId = "BDB69E86-9DB9-4EA1-B9F1-029640C7A68C";
const apiKey = "LeNRpMiOTEuNPWskahS0LaOQBlNszSDjBti7PEBV2cFgsiQGWw3yFxgD0OCtaZPKgoITd6gHeoSXI1hPXu5qdw==";
const client = new TeleSignSDK(customerId, apiKey);

// MongoDB Connection
mongoose.connect(
    'mongodb+srv://mykelxu:RiceCream124!@parkinsonsdata.5iolr.mongodb.net/locationTracker?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log("MongoDB connected"))
 .catch(err => console.log(err));

// Define Mongoose Schema
const locationSchema = new mongoose.Schema({
    user_id: String,
    name: String,
    location: {
        lat: Number,
        lng: Number,
    },
    timestamp: Date,
    phoneNumber: String,
});

const Location = mongoose.model('Location', locationSchema);

// Function to fetch user's last known location and address
const getUserLocation = async (name) => {
    try {
        const user = await Location.findOne({ name }).sort({ timestamp: -1 });
        if (user && user.location) {
            const address = await getAddressFromCoordinates(user.location.lat, user.location.lng);
            return {
                lat: user.location.lat,
                lng: user.location.lng,
                address: address
            };
        }
    } catch (error) {
        console.error(`Error fetching location for ${name}:`, error);
    }
    return null;
};

// Function to get address from coordinates using Google Maps Geocoding API
const getAddressFromCoordinates = async (lat, lng) => {
    const apiKey = 'AIzaSyB5nXmXgfKvakxNr6hTwO-CzHbGrK-3qno';
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
        const response = await axios.get(geocodeUrl);
        if (response.data.status === 'OK') {
            return response.data.results[0].formatted_address;
        } else {
            return 'Address not found';
        }
    } catch (error) {
        console.error('Error fetching address:', error);
        return 'Error retrieving address';
    }
};

// Function to send SMS alerts
const sendAlert = async (userPhoneNumber, name, location) => {
    let locationMessage = location ? ` Last known location: ${location.address}.` : " Location data unavailable.";
    const message = `ALERT: ${name} has experienced a fall. Please check on them immediately!${locationMessage}`;
    
    function smsCallback(error, responseBody) {
        if (!error) {
            console.log(`SMS sent to ${userPhoneNumber}: ${message}`);
        } else {
            console.error("Error sending SMS:", error);
        }
    }

    client.sms.message(smsCallback, userPhoneNumber, message, "ARN", {});
};

// Fetch fall detection results and trigger alerts
let SMSSentBool = false;
const checkFalls = async () => {
    try {
        const response = await axios.get('https://locusqol.tech/');
        const fallResults = response.data;

        for (const [name, [fallRate, phoneNumber]] of Object.entries(fallResults)) {
            if (fallRate === 1 && !SMSSentBool) {
                SMSSentBool = true;
                console.log(`${name} has fallen! Sending alert...`);

                if (phoneNumber) {
                    const location = await getUserLocation(name);
                    sendAlert(phoneNumber, name, location);
                } else {
                    console.error(`Phone number for ${name} not found.`);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching fall data:", error);
    }
};

// Initial fall check and set interval
checkFalls();
setInterval(checkFalls, 60000);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

