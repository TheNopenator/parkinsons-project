const express = require('express');
const app = express();
const path = require('path');
const http = require('http');

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const server = http.createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
