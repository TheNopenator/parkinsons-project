const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const port = process.env.PORT || 5000;

const mongoURI = 'mongodb+srv://mykelxu:RiceCream124!@parkinsonsdata.5iolr.mongodb.net/locationTracker?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to Mongoose');
  })
  .catch(error => {
    console.error('Error connecting to Mongoose:', error);
    process.exit(1);
  });

const locationSchema = new mongoose.Schema({
  name: String,
  user_id: String,
  location: {
    lat: Number,
    lng: Number
  },
  timestamp: Date,
  device: String,
  note: String,
  phoneNumber: String,
  radius: Number,
  messagesSent: Number
});

const Location = mongoose.model('Location', locationSchema);

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(cors({
  origin: 'https://locusqol.tech'
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/get-location', async (req, res) => {
  const { name } = req.query;
  try {
      console.log(`Fetching location for: ${name}`);

      const userLocation = await Location.findOne({ name });
      
      console.log('Fetched Location Data:', userLocation);

      if (userLocation) {
          res.json(userLocation);
      } else {
          res.status(404).json({ message: 'Location not found' });
      }
  } catch (error) {
      console.error('Error fetching location:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

const server = http.createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});