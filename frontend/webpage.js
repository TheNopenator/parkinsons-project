const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const cors = require('cors');

app.use(express.static(path.join(__dirname)));
app.use(cors({
  origin: 'https://locusqol.tech'
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/get-location', (req, res) => {
  const name = req.query.name;
  res.json({
    latitude: 40.7128,
    longitude: -74.0060,
    radius: 100,
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
