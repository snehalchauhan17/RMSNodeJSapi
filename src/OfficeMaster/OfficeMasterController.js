const { Router } = require('express');
const MongoClient = require('mongodb').MongoClient;
const router = Router();
const connectionString = "mongodb://sa:sa123@10.154.2.131:27017/";
const dbName = "RMS";
const OfficeMastermodel = require('../OfficeMaster/OfficeMasterModel')

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


// Add Distict Master DropDownList

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


router.get("/OfficeMasterList", async (req, res) => {
    try {
      const db = client.db(dbName); // Get the database instance
      const collection = db.collection("OfficeMaster"); 
      console.log(collection,"table");// Get the collection
      const results = await collection.find({}).toArray(); // Query the collection



      res.status(200).send(results); // Send the results as the response
    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).send('Internal Server Error');
    }
  });


router.post('/InsertOffice', async (req,res) => {

      let office = req.body.office
      let id = req.body.id
      let officetype = req.body.officetype
      let dcode = req.body.dcode

      const officeentry = new OfficeMastermodel({
            office : office,
            id : id,
            officetype : officetype,
            dcode : dcode,
      })
      const result = await  officeentry.save()
      console.log(result)
      res.json({
        message: "success",
        dataentry: result
      });
});


router.get('/AllOfficeList', async (req, res) => {
  try {
      const user = await OfficeMastermodel.find();
          res.status(200).json(user);
  } catch (error) {
      res.status(404).json({ message: error.message });
  }
});



//Data Delete
router.delete('/DeleteOffice/:_id', async (req, res) => {
  try {
      var _id = req.params._id
      console.log(_id);
      if (!_id) {
          return res.status(400).json({ message: 'Missing _id field in request body' });
      }

      const deletedRecord = await OfficeMastermodel.findByIdAndDelete(_id);
      console.log(deletedRecord);
      if (!deletedRecord) {
          return res.status(404).json({ message: 'Record not found' });
      }

      return res.json({ message: 'Record deleted successfully' });
  }
  catch (error) {
      return res.status(500).json({ message: error.message });
  }
});



router.get('/FindOfficebyId/:_id', async (req, res) => {

  console.log(req.params._id)
  let user = ''
  try {
      const user = await OfficeMastermodel.findById(req.params._id);
      console.log('User is:', user)
      if (user == null) { // checking for null values
          return res.status(404).json({ message: 'Cannot find Record' })
      }
      res.status(200).json(user);
  } catch (err) {
      return res.status(500).json({ message: err.message })
  }

  // res.send(user) //sending the response

})



router.put('/UpdateOffice/:_id', async (req, res) => {
  try {                
              if (!req.body) {
                  return res.status(400).json({
                      message: "Data to update cannot be empty!"
                  });
              }
     
      const _id = req.params._id;
      const updatedData = req.body;

      // Update the record using Mongoose
      const updatedRecord = await OfficeMastermodel.findByIdAndUpdate(_id, updatedData, { new: true });

      if (!updatedRecord) {
          return res.status(404).json({ message: "Record not found." });
      }

      res.json({ message: "Record updated successfully.", data: updatedRecord });

  } catch (err) {
      // Handle any errors that occur during the update process
      res.status(500).json({
      
          message: err.message || "An error occurred while updating the record."
      });
  }
});

module.exports = router;