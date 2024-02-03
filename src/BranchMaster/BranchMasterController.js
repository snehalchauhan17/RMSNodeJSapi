const { Router } = require('express');
const MongoClient = require('mongodb').MongoClient;
const router = Router();
const connectionString = "mongodb://localhost:27017/";
const dbName = "RMS";

// Create a reusable MongoDB client
const client = new MongoClient(connectionString);

// Connect to the MongoDB database
client.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

// Define your API endpoint
router.get("/BranchList", async (req, res) => {
  try {
    const db = client.db(dbName); // Get the database instance
    const collection = db.collection("BranchMaster"); // Get the collection
    const results = await collection.find({}).limit(10).toArray(); // Query the collection
    res.status(200).send(results); // Send the results as the response
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
