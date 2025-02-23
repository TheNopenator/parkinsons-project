const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const mongoURI = 'mongodb+srv://mykelxu:RiceCream124!@parkinsonsdata.5iolr.mongodb.net/locationTracker?retryWrites=true&w=majority';

let db;

MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db();
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });


app.use(express.static(path.join(__dirname)));
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
      
      if (!db) {
        return res.status(500).json({ message: 'Database connection not available' });
      }

      const userLocation = await db.collection('locations').findOne({ name });
      
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
const port = process.env.PORT || 3000;

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
