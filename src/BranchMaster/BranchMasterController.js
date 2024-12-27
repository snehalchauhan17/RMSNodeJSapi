const { Router } = require('express');
//const MongoClient = require('mongodb').MongoClient;
const router = Router();
// const { connectToMongoose } = require('../dbConfig');
const { connectToMongoClient } = require('../../dbconfig');

// const connectionString = "mongodb://admin:admin123@10.154.2.63:27017/?authSource=admin";
// const dbName = "RMS";

// // Create a reusable MongoDB client
// const client = new MongoClient(connectionString);

// // Connect to the MongoDB database
// client.connect()
//   .then(() => {
//     console.log('Connected to the database');
//   })
//   .catch(err => {
//     console.error('Error connecting to the database:', err);
//   });

//District List For Registration Start and OfficeInsert
router.get("/DistrictList", async (req, res) => {
  try {
  
    const db = await connectToMongoClient();
    const collection = db.collection("DistrictMaster"); // Get the collection
    const results = await collection.find({}).toArray(); // Query the collection
    res.status(200).send(results); // Send the results as the response

  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});
//End


router.get("/OfficeListbyId/:did", async (req, res) => {
  try {
   
    // Convert req.params.did to a number if dcode is a number in MongoDB
    const dcodeValue = parseInt(req.params.did);
    const db = await connectToMongoClient();
    const collection = db.collection("OfficeMaster"); // Get the collection
    const user = await collection.find({ dcode:dcodeValue }).toArray(); // Query the collection

    if (user.length === 0) { // checking for null values
      return res.status(404).json({ message: 'Cannot find Record' })
  }
    res.status(200).send(user); // Send the results as the response

  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get("/BranchListbyID/:idno", async (req, res) => {
  try {

    // Convert req.params.did to a number if dcode is a number in MongoDB
    const officeId = parseInt(req.params.idno);
    const db = await connectToMongoClient();
    const collection = db.collection("BranchMaster"); // Get the collection
    const user = await collection.find({ oid:officeId }).toArray(); // Query the collection

    if (user.length === 0) { // checking for null values
      return res.status(404).json({ message: 'Cannot find Record' })
  }
    res.status(200).send(user); // Send the results as the response

  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});


// router.post('/InsertBranch', async (req, res) => {
//   try {
   
//     const { districtId, officeId, BranchName } = req.body;

   
//     const db = client.db(dbName); // Get the database instance
//     const collection = db.collection("BranchMaster"); // Get the collection
//     const result = {
//       dcode: districtId,
//       oid: officeId,
//       BRANCH: BranchName,
//   };



//     await collection.insertOne(result); // Insert the new office into the collection
//     // Respond with the newly created office
//     return res.status(201).json(result);

  
//   } catch (error) {
//     console.error("Error inserting branch:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// });
router.post('/InsertBranch', async (req, res) => {
  try {
    const { districtId, officeId, BranchName } = req.body;
    const db = await connectToMongoClient();
    const branchCollection = db.collection("BranchMaster"); // Get the BranchMaster collection

    // Find the current maximum BranchId in the collection
    const maxBranch = await branchCollection
      .find({})
      .sort({ BranchId: -1 }) // Sort in descending order by BranchId
      .limit(1)
      .toArray();

    // Calculate the next BranchId
    const nextBranchId = (maxBranch[0]?.BranchId || 0) + 1;

    // Prepare the new branch document
    const newBranch = {
      BranchId: nextBranchId,
      oid: officeId,
      BRANCH: BranchName,
      dcode: districtId,
    };

    // Insert the new branch into the collection
    await branchCollection.insertOne(newBranch);

    // Respond with the newly created branch
    return res.status(201).json(newBranch);
  } catch (error) {
    console.error("Error inserting branch:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


// Retrieve all users from the database.
router.get("/BranchModelList/:dcode", async (req, res) => {

  try {
    const dcode = req.params.dcode;
  
    console.log('branch list: dcode',dcode);
      const db = await connectToMongoClient();
       const collection = db.collection("BranchMaster"); // Get the collection

       
  // const data = await collection.aggregate([
  //   {
  //     $lookup: {                                    //Left outer join
  //       from: "DistrictMaster",                     // From table Name
  //       localField: "dcode",                   //Field from main table
  //       foreignField: "dcode",                        //Field from table you want to join 
  //        as: "district"                             //alias
  //     }
  //   },
  //   {
  //     $unwind: {
  //         path: '$district', // Unwind to convert the array to a single object
  //         preserveNullAndEmptyArrays: true // Preserve offices with no matching district
  //     }
  // },
  //   {
  //     $lookup: {                                      //Left outer join 
  //       from: "OfficeMaster",                         // From table Name
  //       localField: "oid",                       //Field from main table
  //       foreignField: "idno",                        //Field from table you want to join 
  //      as: "office"                                    //alias
  //     }
  //   },
  //   {
  //     $unwind: {
  //         path: '$office', // Unwind to convert the array to a single object
  //         preserveNullAndEmptyArrays: true // Preserve offices with no matching district
  //     }
  // },

  //   {
  //     $project: {
  //       _id:1,
  //       BRANCH: 1,
  //       districtName: "$district.name_g",
  //       officeName: "$office.name",
  //       dist_id: "$district.did",
  //       dcode:1,
  //       office_id: "$office.idno",
  //       oid:1
  //       // Add other fields if needed
  //     }
  //   }
  // ]).toArray();

  const data = await collection.aggregate([
    {
      $match: { dcode: dcode } // Filter branches by dcode
  },
  
    {
        $lookup: {
            from: "DistrictMaster",         // Join with DistrictMaster
            localField: "dcodedetail",           // Field in BranchMaster
            foreignField: "dcode",         // Field in DistrictMaster
            as: "districtDetails"
        }
    },
    {
        $lookup: {
            from: "OfficeMaster",          // Join with OfficeMaster
            localField: "oiddetail",            // Field in BranchMaster
            foreignField: "idno",         // Field in OfficeMaster
            as: "officeDetails"
        }
    },
    {
        $project: {
            _id: 1,
            dcode: 1,
            oid: 1,
            BRANCH: 1,
            "districtDetails.name_g": 1,  // Select district name
            "officeDetails.name": 1      // Select office name
        }
    },
    {
        $unwind: {
            path: "$districtDetails",    // Flatten the district details array
            preserveNullAndEmptyArrays: true // Keep documents even if no match
        }
    },
    {
        $unwind: {
            path: "$officeDetails",     // Flatten the office details array
            preserveNullAndEmptyArrays: true // Keep documents even if no match
        }
    }
]).toArray();
const data1 = await collection.aggregate([
  { $match: { dcode: dcode } },
  { $lookup: { from: "DistrictMaster", localField: "dcode", foreignField: "dcode", as: "districtDetails" } },
  { $lookup: { from: "OfficeMaster", localField: "oid", foreignField: "idno", as: "officeDetails" } }
]).toArray();
console.log('Joined Data:', data1);

// Debug: Log the processed data
console.log('Data:', data);
res.status(200).json(data);

  } catch (error) {
      res.status(404).json({ message: error.message });
  }
});


// Define your API endpoint
router.get("/BranchList", async (req, res) => {
  try {
   
    const db = await connectToMongoClient();
    const collection = db.collection("BranchMaster"); // Get the collection
    const results = await collection.find({}).toArray(); // Query the collection
    res.status(200).send(results); // Send the results as the response
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});



module.exports = router;
