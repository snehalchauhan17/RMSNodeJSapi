const { Router } = require('express');
const MongoClient = require('mongodb').MongoClient;
const router = Router();
const connectionString = "mongodb://admin:admin123@10.154.2.63:27017/?authSource=admin";
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

router.post("/InsertOffice", async (req, res) => {
    const { name, OTYP, dcode } = req.body;
    console.log("Office Insert req:",req.body);
    try {
        // Step 1: Connect to MongoDB
        await client.connect();

        // Select your database and collection (replace with your actual DB and collection names)
        const database = client.db(dbName); // Replace with your DB name
        const collection = database.collection("OfficeMaster"); // Get the collection


        const lastOffice = await collection
        .find({ idno: { $gte: parseFloat(`${dcode}.00`), $lt: parseFloat(`${dcode + 1}.00`) } })
        .sort({ idno: -1 })
        .limit(1)
        .toArray();

            console.log("last Office:",lastOffice);

            let newOfficeId;

            if (lastOffice.length > 0) {
              // Extract the last idno and increment it
              const lastIdno = lastOffice[0].idno; // Correctly access the idno as a float
              newOfficeId = parseFloat((lastIdno + 0.01).toFixed(2)); // Increment by 0.01
          } else {
              // Start with districtId.01 if no offices exist
              newOfficeId = parseFloat(`${dcode}.01`);
          }

        const newOffice = {
          idno: newOfficeId, // Store as float
          name: name, // Store as string
          OTYP: parseInt(OTYP, 10), // Store as int
          dcode: parseInt(dcode, 10), // Store as int
      };

        console.log("New Office:",newOffice);
        await collection.insertOne(newOffice); // Insert the new office into the collection
        console.log("New Office:",newOffice);
        // Respond with the newly created office
        return res.status(201).json(newOffice);
        console.log("New Office:",newOffice);

    } catch (error) {
        console.error('Error creating new office:', error);
        return res.status(500).json({ message: 'Error creating new office', error });
    } finally {
        // Ensure the client is closed after the operation is complete
        await client.close();
    }
});

router.get("/BranchList", async (req, res) => {
  try {
    const db = client.db(dbName); // Get the database instance
    const collection = db.collection("BranchMaster"); // Get the collection
    const results = await collection.find({}).limit(10).toArray(); // Query the collection
    res.status(200).send(results); // Send the results as the response\
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Define your API endpoint
router.get("/BranchList", async (req, res) => {
  try {
    const db = client.db(dbName); // Get the database instance
    const collection = db.collection("BranchMaster"); // Get the collection
    const results = await collection.find({}).limit(10).toArray(); // Query the collection
    res.status(200).send(results); // Send the results as the response\
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Add Distict Master DropDownList



router.get("/OfficeMasterList", async (req, res) => {
    try {
      const db = client.db(dbName); // Get the database instance
      const collection = db.collection("OfficeMaster"); 
      console.log(collection,"table");// Get the collection

        // Perform aggregation with $lookup to join with districtmaster
        const results = await collection.aggregate([
          {
              $lookup: {
                  from: 'DistrictMaster', // The collection to join
                  localField: 'dcode', // Field from officemaster collection
                  foreignField: 'did', // Field from districtmaster collection
                  as: 'districtInfo' // Output array field
              }
          },
          {
              $unwind: {
                  path: '$districtInfo', // Unwind to convert the array to a single object
                  preserveNullAndEmptyArrays: true // Preserve offices with no matching district
              }
          },
          {
            // Project to return only the needed fields
            $project: {
                idno: 1, // Include idno
                name: 1, // Include name
                OTYP: 1, // Include OTYP
                dname: '$districtInfo.dname' // Include district name from the joined collection
            }
        }
      ]).toArray();

     // const results = await collection.find({}).toArray(); // Query the collection

console.log("OfficeList",results);

      res.status(200).send(results); // Send the results as the response

    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).send('Internal Server Error');
    }
  });







//Data Delete
router.delete('/DeleteOffice/:_id', async (req, res) => {
  try {
      var _id = req.params._id
      if (!_id) {
          return res.status(400).json({ message: 'Missing _id field in request body' });
      }

      const deletedRecord = await OfficeMastermodel.findByIdAndDelete(_id);
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

  let user = ''
  try {
      const user = await OfficeMastermodel.findById(req.params._id);
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


// router.get("/DistrictList", async (req, res) => {
//   try {
//     const db = client.db(dbName); // Get the database instance
//     const collection = db.collection("DistrictMaster"); // Get the collection
//     const results = await collection.find({}).toArray(); // Query the collection
//     res.status(200).send(results); // Send the results as the response
//     console.log("District List Master Dropdown",results);
//   } catch (error) {
//     console.error('Error retrieving data:', error);
//     console.log('Error retrieving data:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });
// router.post('/InsertOffice', async (req,res) => {

//   let office = req.body.office
//   let id = req.body.id
//   let officetype = req.body.officetype
//   let dcode = req.body.dcode

//   const officeentry = new OfficeMastermodel({
//         office : office,
//         id : id,
//         officetype : officetype,
//         dcode : dcode,
//   })
//   const result = await  officeentry.save()
//   res.json({
//     message: "success",
//     dataentry: result
//   });
// });