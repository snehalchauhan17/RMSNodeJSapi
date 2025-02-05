const { Router } = require('express');
//const MongoClient = require('mongodb').MongoClient;
const router = Router();
// const { connectToMongoose } = require('../dbConfig');
const { connectToMongoClient } = require('../../dbconfig');

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
    const user = await collection.find({ dcode: dcodeValue }).toArray(); // Query the collection

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
    const user = await collection.find({ oid: officeId }).toArray(); // Query the collection

    if (user.length === 0) { // checking for null values
      return res.status(404).json({ message: 'Cannot find Record' })
    }
    res.status(200).send(user); // Send the results as the response

  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});


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
      oid: Number(officeId),
      BRANCH: BranchName,
      dcode: Number(districtId),
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
    const Pera_dcode = Number(req.params.dcode);
    const db = await connectToMongoClient();
    //  const collection = db.collection("BranchMaster"); // Get the collection



    const branchmasterCollection = db.collection("BranchMaster"); // Get the collection
    const result = await branchmasterCollection.aggregate([
      // First lookup: Join with DistrictMaster
      {
        $lookup: {
          from: "DistrictMaster",         // Collection to join
          localField: "dcode",           // Field in Branchmaster
          foreignField: "dcode",         // Field in DistrictMaster
          as: "districtDetails"          // Alias for the joined data
        }
      },
      { $unwind: '$districtDetails' },    // Flatten the districtDetails array

      // Second lookup: Join with OfficeMaster
      {
        $lookup: {
          from: "OfficeMaster",         // Collection to join
          localField: "oid",             // Field in Branchmaster
          foreignField: "idno",          // Field in officeDetails
          as: "officeDetails"            // Alias for the joined data
        }
      },
      { $unwind: '$officeDetails' },      // Flatten the officeDetails array

      // Filtering condition
      { $match: { dcode: Pera_dcode } },           // Match the specific dcode

      // Project the required fields
      {
        $project: {
          BRANCH: 1,                      // Branch name from Branchmaster
          DistrictName: '$districtDetails.name_g',    // Gujarati district name
          OfficeName: '$officeDetails.name',  // Office name from officeDetails
          _id: 0                          // Exclude the _id field
        }
      }
    ]).toArray();


    res.status(200).json(result);

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
