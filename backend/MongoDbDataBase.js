/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Switch to the correct database, or create a new one
use('locationTracker');

// Create a new collection 'locations' with data about users' locations
db.getCollection('locations').insertMany([
  {
    user_id: '1a2b3c4d5e',
    name: 'John Doe',
    location: { lat: 37.7749, lng: -122.4194 },
    timestamp: new Date('2023-02-20T15:15:00Z'),
    device: 'mobile',
    note: 'User walking near the park.'
  },
  {
    user_id: '6f7g8h9i0j',
    name: 'Jane Smith',
    location: { lat: 40.7128, lng: -74.0060 },
    timestamp: new Date('2023-02-20T16:30:00Z'),
    device: 'mobile',
    note: 'User near Times Square.'
  },
  {
    user_id: '2a4b6c8d9f',
    name: 'Bob Johnson',
    location: { lat: 34.0522, lng: -118.2437 },
    timestamp: new Date('2023-02-20T17:45:00Z'),
    device: 'tablet',
    note: 'User at the beach.'
  },
  {
    user_id: '3e5f7g9h1i',
    name: 'Alice Brown',
    location: { lat: 51.5074, lng: -0.1278 },
    timestamp: new Date('2023-02-20T18:00:00Z'),
    device: 'smartwatch',
    note: 'User walking around the museum.'
  },
  {
    user_id: '4d6e8f1g2h',
    name: 'Charlie Wilson',
    location: { lat: 48.8566, lng: 2.3522 },
    timestamp: new Date('2023-02-20T19:00:00Z'),
    device: 'mobile',
    note: 'User near the Eiffel Tower.'
  }
]);
