const { Router } = require('express');
const MongoClient = require('mongodb').MongoClient;
const BranchMasterModel = require('../BranchMaster/BranchMasterModel');
const router = Router();
const connectionString = "mongodb://admin:admin123@10.154.2.63:27017/?authSource=admin";
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

//District List For Registration Start and OfficeInsert
router.get("/DistrictList", async (req, res) => {
  try {
    const db = client.db(dbName); // Get the database instance
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
    const db = client.db(dbName); // Get the database instance
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
    console.log('District Code (param):', req.params.idno);

    // Convert req.params.did to a number if dcode is a number in MongoDB
    const officeId = parseInt(req.params.idno);
   // console.log('Converted District Code:', officeId);
    const db = client.db(dbName); // Get the database instance
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
router.post('/InsertBranch', async (req, res) => {

  let districtId = req.body.districtId
  let officeId = req.body.officeId
  let BranchName = req.body.BranchName
 
  const branchmastermodel = new BranchMasterModel({

    districtId: districtId,
    officeId: officeId,
    BranchName: BranchName,

  })
  const result = await branchmastermodel.save()

  res.json({
      message: "success",
      dataentry: result
  });
});

// Retrieve all users from the database.
router.get('/BranchModelList', async (req, res) => {

  try {
  const data = await BranchMasterModel.aggregate([
    {
      $lookup: {                                    //Left outer join
        from: "DistrictMaster",                     // From table Name
        localField: "districtId",                   //Field from main table
        foreignField: "did",                        //Field from table you want to join 
         as: "district"                             //alias
      }
    },
    {
      $unwind: "$district"
    },
    {
      $lookup: {                                      //Left outer join 
        from: "OfficeMaster",                         // From table Name
        localField: "officeId",                       //Field from main table
        foreignField: "idno",                        //Field from table you want to join 
       as: "office"                                    //alias
      }
    },
    {
      $unwind: "$office"
    },
    {
      $match: {
        $and: [
          { "district.did": { $exists: true } }, // Filter out branches without matching districts
          { "office.idno": { $exists: true } }   // Filter out branches without matching offices
        ]
      }
    },
    {
      $project: {
        _id:1,
        BranchName: 1,
        districtName: "$district.dname",
        officeName: "$office.name",
        dist_id: "$district.did",
        districtId:1,
        office_id: "$office.idno",
        officeId:1
        // Add other fields if needed
      }
    }
  ]);
    //res.status(200).json(data);
    //  const user = await collection.find({}).limit(10).toArray();
      console.log(data);
      
          res.status(200).json(data);
  } catch (error) {
      res.status(404).json({ message: error.message });
  }
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
