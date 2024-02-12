const { Router } = require('express');
const MongoClient = require('mongodb').MongoClient;
const DataEntry = require('../DataEntry/DataEntryModel')
const router = Router();
const connectionString = "mongodb://sa:sa123@10.154.2.131:27017/";
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

// router.get("/searchRecordList", async (req, res) => {
//   try {
//     const db =client.db(dbName); 
//     // Extract search parameters from the query string
//     const { year, branch, category, types, subject, name, address, village, taluka, orderName, cupBoardNo, partitionNo, fileNo } = req.query;

//     // Construct the query based on the received parameters
//     const query = {};

//     if (year) {
//       query.Year = { $regex: new RegExp(year, 'i') };
//     }
//     if (branch) {
//       query.Branch = { $regex: new RegExp(branch, 'i') };
//     }
//     if (category) {
//       query.Category = { $regex: new RegExp(branch, 'i') };
//     }
//     if (types) {
//       query.Types = { $regex: new RegExp(branch, 'i') };
//     }
//     if (subject) {
//       query.Subject = { $regex: new RegExp(branch, 'i') };
//     }

//     if (name) {
//       query.Name = { $regex: new RegExp(branch, 'i') };
//     }
//     if (address) {
//       query.Address = { $regex: new RegExp(branch, 'i') };
//     }
//     if (village) {
//       query.Village = { $regex: new RegExp(branch, 'i') };
//     }

//     if (taluka) {
//       query.Taluka = { $regex: new RegExp(branch, 'i') };
//     }
//     if (orderName) {
//       query.OrderName = { $regex: new RegExp(branch, 'i') };
//     }
//     if (cupBoardNo) {
//       query.CupBoardNo = { $regex: new RegExp(branch, 'i') };
//     }
//     if (partitionNo) {
//       query.PartitionNo = { $regex: new RegExp(branch, 'i') };
//     }
//     if (fileNo) {
//       query.FileNo = { $regex: new RegExp(branch, 'i') };
//     }

//     // Add conditions for other fields as needed

//     //Perform the search
//     // const collection = db.collection("DataEntry"); // Get the collection

//     // const cursor = collection.find(query);
//     // const documents = await cursor.toArray();
//      const records = await DataEntry.find(query);
// console.log(records);
//     res.json(records);
//   } catch (error) {
//     console.error('Error Occurred:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// router.get("/searchRecordList", async (req, res) => {
//   try {
//     const db = client.db(RMS);

//     // Read operation
//     const findDocuments = async (DataEntry, query = {}) => {
//       const collection = db.collection(DataEntry);
//       const cursor = collection.find(query);
//       const documents = await cursor.toArray();
//       return documents;
//     };

//     // Example usage
//     const query = {
//       $or: [
//         { Year: { $regex: /pattern1/, $options: 'i' } }, // Regex pattern for field1
//         { Year: null }, // Searching for null value in field1
//         { Year: { $exists: true } }, // Searching for field1 with any value

//         { Branch: { $regex: /pattern2/, $options: 'i' } }, // Regex pattern for field2
//         { Branch: null }, // Searching for null value in field2
//         { Branch: { $exists: true } }, // Searching for field2 with any value

//         { Category: { $regex: /pattern3/, $options: 'i' } }, // Regex pattern for field3
//         { Category: null }, // Searching for null value in field3
//         { Category: { $exists: true } }, // Searching for field3 with any val

//         { Types: { $regex: /pattern3/, $options: 'i' } }, // Regex pattern for field1
//         { Types: null }, // Searching for null value in field1
//         { Types: { $exists: true } }, // Searching for field1 with any value

//         { Subject: { $regex: /pattern4/, $options: 'i' } }, // Regex pattern for field2
//         { Subject: null }, // Searching for null value in field2
//         { Subject: { $exists: true } }, // Searching for field2 with any value

//         { Name: { $regex: /pattern5/, $options: 'i' } }, // Regex pattern for field3
//         { Name: null }, // Searching for null value in field3
//         { Name: { $exists: true } }, // Searching for field3 with any val

//         { Address: { $regex: /pattern6/, $options: 'i' } }, // Regex pattern for field1
//         { Address: null }, // Searching for null value in field1
//         { Address: { $exists: true } }, // Searching for field1 with any value

//         { Village: { $regex: /pattern7/, $options: 'i' } }, // Regex pattern for field2
//         { Village: null }, // Searching for null value in field2
//         { Village: { $exists: true } }, // Searching for field2 with any value

//         { Taluka: { $regex: /pattern8/, $options: 'i' } }, // Regex pattern for field3
//         { Taluka: null }, // Searching for null value in field3
//         { Taluka: { $exists: true } },// Searching for field3 with any val

//         { OrderName: { $regex: /pattern9/, $options: 'i' } }, // Regex pattern for field3
//         { OrderName: null }, // Searching for null value in field3
//         { OrderName: { $exists: true } }, // Searching for field3 with any val

//         { CupBoardNo: { $regex: /pattern10/, $options: 'i' } }, // Regex pattern for field3
//         { CupBoardNo: null }, // Searching for null value in field3
//         { CupBoardNo: { $exists: true } },// Searching for field3 with any val

//         { PartitionNo: { $regex: /pattern11/, $options: 'i' } }, // Regex pattern for field3
//         { PartitionNo: null }, // Searching for null value in field3
//         { PartitionNo: { $exists: true } }, // Searching for field3 with any value

//         { FileNo: { $regex: /pattern12/, $options: 'i' } }, // Regex pattern for field3
//         { FileNo: null }, // Searching for null value in field3
//         { FileNo: { $exists: true } } // Searching for field3 with any value



//       ]
//     };

//     const documents = await findDocuments('DataEntry', query);
//     res.json(documents);
//   }
//   catch (error) {
//     console.error('Error Occur', error)
//   }
// })

module.exports = router;
