const { Router } = require('express')
const DataEntry = require('../DataEntry/DataEntryModel')
const router = Router()
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Import axios for making API calls
const { connectToMongoClient } = require('../../dbconfig');
// const MongoClient = require('mongodb').MongoClient;
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


router.get("/TalukaListFromDist", async (req, res) => {
    try {
      

      const db = await connectToMongoClient();
      const collection = db.collection("TalukaMaster"); 

        // Perform aggregation with $lookup to join with districtmaster
        const results = await collection.aggregate([
          {
              $lookup: {
                  from: 'DistrictMaster', // The collection to join
                  localField: 'DCode', // Field from TalukaMaster collection
                  foreignField: 'dcode', // Field from districtmaster collection
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
                TCode: 1, // Include idno
                TalName_G: 1, // Include name
                DCode: 1, // Include OTYP
                dname: '$districtInfo.name_g' // Include district name from the joined collection
            }
        }
      ]).toArray();

     // const results = await collection.find({}).toArray(); // Query the collection


      res.status(200).send(results); // Send the results as the response

    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).send('Internal Server Error');
    }
  });


  router.get("/VillageListbyID/:dcode/:TCode", async (req, res) => {
    try {
      // Convert req.params.did to a number if dcode is a number in MongoDB
      const tcode = parseInt(req.params.TCode);
      const dcode = parseInt(req.params.dcode);
          
     const db = await connectToMongoClient();
      const collection = db.collection("VillageMaster"); // Get the collection
      const user = await collection.find({  dcode: dcode ,tcode:tcode }).toArray(); // Query the collection
      if (user.length === 0) { // checking for null values
        return res.status(404).json({ message: 'Cannot find Village' })
    }
      res.status(200).send(user); // Send the results as the response
  
    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).send('Internal Server Error');
    }
  });
//Data Enter
router.post('/InsertRecord', async (req, res) => {

    let Year             = req.body.Year       
    let IssueDate        = req.body.IssueDate  
    let Branch           = req.body.Branch     
    let Category         = req.body.Category   
    let Name             = req.body.Name       
    let Address          = req.body.Address    
    let Subject          = req.body.Subject       
    let HukamNo          = req.body.HukamNo    
    let HukamDate        = req.body.HukamDate  
    let DCode           = req.body.dcode     
    let Taluka           = req.body.Taluka     
    let Village          = req.body.Village    
    let SurveyNo 	     = req.body.SurveyNo 	
    let CompactorNo      = req.body.CompactorNo
    let PotlaNo          = req.body.PotlaNo    
    let FeristNo 	     = req.body.FeristNo 	
    let NotePage 	     = req.body.NotePage 	
    let PostPage 	     = req.body.PostPage 	
    let TotalPage        = req.body.TotalPage  
    let anyDetail        = req.body.anyDetail  
    let documentId       = req.body.documentId 

    const dataentry = new DataEntry({

        Year         :Year         ,
        IssueDate    :IssueDate    ,
        Branch       :Branch       ,
        Category     :Category     ,
        Name         :Name         ,
        Address      :Address      ,
        Subject      :Subject      , 
        HukamNo      :HukamNo      ,
        HukamDate    :HukamDate    ,
        DCode       :DCode       ,
        Taluka       :Taluka       ,
        Village      :Village      ,
        SurveyNo 	 :SurveyNo 	   ,
        CompactorNo  :CompactorNo  ,
        PotlaNo      :PotlaNo      ,
        FeristNo 	 :FeristNo 	   ,
        NotePage 	 :NotePage 	   ,
        PostPage 	 :PostPage 	   ,
        TotalPage    :TotalPage    ,
        anyDetail    :anyDetail    ,
        documentId   :documentId   

    })
    const result = await dataentry.save()

    res.json({
        message: "success",
        dataentry: result
    });
});

//Data Update
router.put('/UpdateRecord/:_id', async (req, res) => {
    try {
                // Check if the request body is empty
                if (!req.body) {
                    return res.status(400).json({
                        message: "Data to update cannot be empty!"
                    });
                }

       
        const _id = req.params._id;
        const updatedData = req.body;
        // Update the record using Mongoose
        const updatedRecord = await DataEntry.findByIdAndUpdate(_id, updatedData, { new: true });
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

//Data Delete
router.delete('/DeleteRecord/:_id', async (req, res) => {
    try {
        var _id = req.params._id

        if (!_id) {
            return res.status(400).json({ message: 'Missing _id field in request body' });
        }

        const deletedRecord = await DataEntry.findByIdAndDelete(_id);

        if (!deletedRecord) {
            return res.status(404).json({ message: 'Record not found' });
        }

        return res.json({ message: 'Record deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/FindRecordbyID/:_id', async (req, res) => {

    let user = ''
    try {
        const user = await DataEntry.findById(req.params._id);
        if (user == null) 
        { // checking for null values
            return res.status(404).json({ message: 'Cannot find Record' })
        }
        res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    // res.send(user) //sending the response

})

// Retrieve all users from the database.
router.get('/RecordList', async (req, res) => {

    try {
      const db = await connectToMongoClient();
      const collection = db.collection("dataentries"); 

      const results = await collection.aggregate([
        {
            $lookup: {
                from: 'TalukaMaster',
                let: { dCode: '$DCode', taluka: '$Taluka' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    // { $eq: ['$DCode', '$$dCode'] },
                                    // { $eq: ['$TCode', '$$taluka'] }
                                    { $eq: [{ $toString: '$DCode' }, '$$dCode'] },  // Type casting
                                    { $eq: [{ $toString: '$TCode' }, '$$taluka'] }  // Type casting
                                ]
                            }
                        }
                    }
                ],
                as: 'talukaDetails'
            }
        },
        { $unwind: { path: '$talukaDetails', preserveNullAndEmptyArrays: true } },
    
        {
            $lookup: {
                from: 'VillageMaster',
                let: { dCode: '$DCode', taluka: '$Taluka', village: '$Village' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    // { $eq: ['$dcode', '$$dCode'] },
                                    // { $eq: ['$tcode', '$$taluka'] },
                                    // { $eq: ['$dtv', '$$village'] }

                                    { $eq: [{ $toString: '$dcode' }, '$$dCode'] },  // Type casting
                                    { $eq: [{ $toString: '$tcode' }, '$$taluka'] }, // Type casting
                                    { $eq: [{ $toString: '$dtv' }, '$$village'] }   // Type casting
                                ]
                            }
                        }
                    }
                ],
                as: 'villageDetails'
            }
        },
        { $unwind: { path: '$villageDetails', preserveNullAndEmptyArrays: true } },
    
        {
            $lookup: {
                from: 'BranchMaster',
                let: { branchId: { $toString: '$Branch' } },  // Cast local field to string
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [{ $toString: '$_id' }, '$$branchId']  // Cast _id to string
                            }
                        }
                    }
                ],
                as: 'branchMaster'
            }
        },
        { $unwind: { path: '$branchMaster', preserveNullAndEmptyArrays: true } },
    
        {
            $project: {
                _id: 1,
                DCode: 1,
                Taluka: 1,
                Village: 1,
                TalukaName: '$talukaDetails.TalName_G',  // Correct field from TalukaMaster
                VillageName: '$villageDetails.vname_g',  // Correct field from VillageMaster
                DistrictName: '$talukaDetails.DistName_G', // Correct field from TalukaMaster
                BranchName: '$branchMaster.BRANCH', // Correct field from BranchMaster
                // Other fields
                Year: 1, IssueDate: 1, Branch: 1, Category: 1, Name: 1, Address: 1,
                Subject: 1, HukamNo: 1, HukamDate: 1, SurveyNo: 1, CompactorNo: 1,
                PotlaNo: 1, FeristNo: 1, NotePage: 1, PostPage: 1, TotalPage: 1,
                anyDetail: 1, documentId: 1
            }
        }
    ]).toArray();

      res.status(200).send(results); // Send the results as the response
} catch (error) {
    console.error('Error fetching records:', error);
    throw error;
}
});


router.get("/searchRecordList", async (req, res) => {
    try {
  
      const db = await connectToMongoClient();
      const collection = db.collection("dataentries");
      const TalukaMaster = db.collection("TalukaMaster");
      const VillageMaster = db.collection("VillageMaster");
      const BranchMaster = db.collection("BranchMaster");
  
      // Extract search parameters from the query string
      const { Year, Branch, Category, HukamNo, HukamDate,DCode, Taluka, Village, SurveyNo, Name, Subject, PotlaNo, FeristNo } = req.query;
      const query = {};
  
      // Add year and other filters to query
      if (Year) {
        query.Year = { $regex: new RegExp(Year, 'i') };
      }
  
      // Handle Branch Lookup
      if (Branch) {
        const branchRecord = await BranchMaster.findOne({ BRANCH: { $regex: new RegExp(`^${Branch}$`, 'i')} });

        if (branchRecord) {
          query.Branch = branchRecord._id.toString();

        } else {
          return res.status(404).json({ message: "Branch not found" });
        }
      }
  
      // Handle Taluka Lookup
      if (Taluka) {
        const talukaRecord = await TalukaMaster.findOne({ TalName_G: { $regex: new RegExp(`^${Taluka}$`, 'i') } });
        if (talukaRecord) {
            query.Taluka = talukaRecord.TCode.toString();
query.DCode = talukaRecord.DCode.toString();
        //   query.Taluka = talukaRecord.TCode;
        //   query.DCode = talukaRecord.DCode;

        } else {
          return res.status(404).json({ message: "Taluka not found" });
        }
      }
  
      // Handle Village Lookup
      if (Village) {
        const villageRecord = await VillageMaster.findOne({ vname_g: { $regex: new RegExp(`^${Village}$`, 'i') } });
        if (villageRecord) {
          query.Village = villageRecord.dtv.toString();
          query.Taluka = villageRecord.tcode.toString();
          query.DCode = villageRecord.dcode.toString();
        } else {
          return res.status(404).json({ message: "Village not found" });
        }
      }
  
      // Handle other fields
      if (Category) query.Category = { $regex: new RegExp(Category, 'i') };
      if (HukamNo) query.HukamNo = { $regex: new RegExp(HukamNo, 'i') };
      if (HukamDate) query.HukamDate = { $regex: new RegExp(HukamDate, 'i') };
      if (SurveyNo) query.SurveyNo = { $regex: new RegExp(`^${SurveyNo}$`, 'i') };
      if (Name) query.Name = { $regex: new RegExp(Name, 'i') };
      if (Subject) query.Subject = { $regex: new RegExp(Subject, 'i') };
      if (PotlaNo) query.PotlaNo = { $regex: new RegExp(`^${PotlaNo}$`, 'i') };
      if (FeristNo) query.FeristNo = { $regex: new RegExp(FeristNo, 'i') };


      // Check simple find results before aggregation
      const simpleResults = await collection.find(query).toArray();

      const results = await collection.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'TalukaMaster',
            let: { dCode: { $toString: '$DCode' }, taluka: { $toString: '$Taluka' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: [{ $toString: '$DCode' }, '$$dCode'] },
                      { $eq: [{ $toString: '$TCode' }, '$$taluka'] }
                    ]
                  }
                }
              }
            ],
            as: 'talukaDetails'
          }
        },
        { $unwind: { path: '$talukaDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'VillageMaster',
            let: { dCode: { $toString: '$DCode' }, taluka: { $toString: '$Taluka' }, village: { $toString: '$Village' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: [{ $toString: '$dcode' }, '$$dCode'] },
                      { $eq: [{ $toString: '$tcode' }, '$$taluka'] },
                      { $eq: [{ $toString: '$dtv' }, '$$village'] }
                    ]
                  }
                }
              }
            ],
            as: 'villageDetails'
          }
        },
        { $unwind: { path: '$villageDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'BranchMaster',
            let: { branchId: { $toString: '$Branch' } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toString: '$_id' }, '$$branchId'] }
                }
              }
            ],
            as: 'branchMaster'
          }
        },
        { $unwind: { path: '$branchMaster', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            DCode: 1,
            Taluka: 1,
            Village: 1,
            TalukaName: '$talukaDetails.TalName_G',
            VillageName: '$villageDetails.vname_g',
            DistrictName: '$talukaDetails.DistName_G',
            BranchName: '$branchMaster.BRANCH',
            Year: 1,
            IssueDate: 1,
            Branch: 1,
            Category: 1,
            Name: 1,
            Address: 1,
            Subject: 1,
            HukamNo: 1,
            HukamDate: 1,
            SurveyNo: 1,
            CompactorNo: 1,
            PotlaNo: 1,
            FeristNo: 1,
            NotePage: 1,
            PostPage: 1,
            TotalPage: 1,
            anyDetail: 1,
            documentId: 1
          }
        }
      ]).toArray();
  


      res.status(200).send(results); // Send the results as the response
    } catch (error) {
      console.error('Error Occurred:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  



  router.get("/generatepdf", async (req, res) => {

    // Construct the query parameters from the request
    const queryParams = req.query; // Directly get the query parameters

  
    // Call the searchRecordList API to fetch records
    const searchResponse = await axios.get(`http://10.154.2.172:3000/api/searchRecordList`, { params: queryParams });
    const records = searchResponse.data;
  

    const doc = new PDFDocument();
    let filename = 'my-document.pdf';
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');
  
    // Pipe the PDF into the response
    doc.pipe(res);
  
    // Load the Gujarati font (replace with the path to your font file)
    const gujaratiFontPath = path.join(__dirname, '..', 'Font', 'Shruti.ttf');

    doc.registerFont('GujaratiFont', gujaratiFontPath);
  
    // Add content to the PDF using the Gujarati font
    doc.font('GujaratiFont').fontSize(20).text('રેકોર્ડ લિસ્ટ', { align: 'center' });
    doc.moveDown();
  
    // Define headers and corresponding fields
    const headers = [
      { header: 'ફાઇલનુ વર્ષ', field: 'Year' },
      { header: 'શાખા', field: 'Branch' },
      { header: 'વર્ગ', field: 'Category' },
      { header: 'આખરી હુકમ નંબર', field: 'HukamNo' },
      { header: 'હુકમ ની તારીખ', field: 'HukamDate' },
      { header: 'તાલુકો', field: 'Taluka' },
      { header: 'ગામ', field: 'Village' },
      { header: 'સર્વે નંબર', field: 'SurveyNo' },
      { header: 'અરજદાર નુ નામ', field: 'Name' },
      { header: 'વિષય', field: 'Subject' },
      { header: 'પોટલા નંબર', field: 'PotlaNo' },
      { header: 'ફેરીસ્ટ નંબર', field: 'FeristNo' }
    ];
  
    // Dynamically calculate column widths with increased space
    const columnWidths = headers.map(header => {
      return Math.max(header.header.length * 3, 50); // Increase width to handle long texts like 'Subject', 'PotlaNo', 'FeristNo'
    });
  
    const tableWidth =700; 
const headerHeight = 70; // Height of the header row
//const rowHeight = 80; // Height of each regular row

//const xOffset = 10;  //this code dynamic  without modify other code 
    // // Calculate the total table width
    // const tableWidth = columnWidths.reduce((total, width) => total + width, 0);
  
    // const headerHeight = 80; // Fixed header height
    // const rowHeight = 90; // Increased row height to fit longer text
    // const xOffset = 5;
  
    const rowHeight = 70; // Decreased row height to fit better (adjust as needed)
    const xOffset = 10;
    const pageHeight = 750; // Define a maximum page height (adjust based on your needs)
  
    let y = doc.y;
    let rowCount = 0; // Track rows to manage page breaks
  
    // Draw header row
    doc.fontSize(10).fillColor('black');
    headers.forEach((item, i) => {
      const cellWidth = columnWidths[i];
      const cellX = xOffset + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
  
      // Draw header cell with headerHeight
      doc.rect(cellX, y, cellWidth, headerHeight).fillAndStroke('lightgray', 'black');
  
      // Draw header text
      doc.fillColor('black').text(item.header, cellX + 5, y + 10, { width: cellWidth - 10, align: 'center' });
    });
  
    // Draw a line under the header
    y += headerHeight; // Move down to the next row position
    doc.moveTo(xOffset, y).lineTo(xOffset + tableWidth, y).stroke();
    y += 5; // Add some space before the first data row
  
    // Loop through each record and create table rows
    records.forEach(item => {
      if (y + rowHeight > pageHeight) {
        // Check if there is enough space on the current page
        doc.addPage(); // Add a new page if needed
        y = 0; // Reset Y position for the new page
        rowCount = 0; // Reset row count on a new page
      }
  
      // Draw table rows
      doc.fontSize(7);
      doc.fillColor('black');
      headers.forEach((header, i) => {
        const cellWidth = columnWidths[i];
        const cellX = xOffset + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        const cellValue = item[header.field] || '';
  
        // Draw cell border for regular rows
        doc.rect(cellX, y, cellWidth, rowHeight).stroke();
  
        // Draw cell value
        doc.text(cellValue, cellX + 5, y + 5, { width: cellWidth - 10, align: 'center' });
      });
  
      // Move to the next row
      y += rowHeight;
      rowCount++;
  
      // If the row count exceeds a certain threshold (e.g., 10 rows), consider adding a new page
      if (rowCount > 10) {
        doc.addPage();
        y = 0; // Reset y position
        rowCount = 0; // Reset row count
      }
    });
  
    // Finalize the PDF and end the stream
    doc.end();
  });
module.exports = router;

