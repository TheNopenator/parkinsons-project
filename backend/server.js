const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Enable CORS to allow the frontend to make requests to this server
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://mykelxu:RiceCream124!@parkinsonsdata.5iolr.mongodb.net/locationTracker?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
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
  timestamp: Date,
  device: String,
  note: String,
});

// Create a Mongoose model for locations
const Location = mongoose.model('Location', locationSchema);

// Randomly update the user's location every 5 seconds for all users in the database
setInterval(async () => {
  const users = await Location.find();  // Get all users from the database

  for (let user of users) {
    const currentLat = user.location.lat + (Math.random() - 0.5) * 0.01;  // Randomly update latitude
    const currentLng = user.location.lng + (Math.random() - 0.5) * 0.01;  // Randomly update longitude

    // Update the user's location in the MongoDB database
    await Location.updateOne(
      { user_id: user.user_id },  // Match user by their user_id
      { 
        location: { lat: currentLat, lng: currentLng }, 
        timestamp: new Date() 
      }
    );

    console.log(`Updated ${user.name}'s location to: ${currentLat}, ${currentLng}`);
  }
}, 5000);  // Update every 5 seconds

// Endpoint to get a user's location by their name
app.get('/get-location', async (req, res) => {
  const { name } = req.query;  // Get the name from the query string

  try {
    const person = await Location.findOne({ name });

    if (person) {
      res.json({
        message: `Location for ${name}:`,
        latitude: person.location.lat,
        longitude: person.location.lng,
        timestamp: person.timestamp,
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
