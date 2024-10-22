const { Router } = require('express')
const DataEntry = require('../DataEntry/DataEntryModel')
const router = Router()
const BranchMaster = require('../BranchMaster/BranchMasterModel')
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Import axios for making API calls

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
console.log(result)
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

    console.log(req.params._id)
    let user = ''
    try {
        const user = await DataEntry.findById(req.params._id);
        console.log('User is:', user)
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
        const user = await DataEntry.find();
        -
            res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


router.get("/searchRecordList", async (req, res) => {
    try {
      console.log(req.query,"Requested Query");
      //const db =client.db(dbName); 
      // Extract search parameters from the query string
      const { Year, Branch, Category, HukamNo, HukamDate, Taluka, Village, SurveyNo, Name, Subject, PotlaNo, FeristNo } = req.query;
      const query = {};

      if (Year) {
        query.Year = { $regex: new RegExp(Year, 'i') };
    }
    if (Branch) {
        query.Branch = { $regex: new RegExp(Branch, 'i') };
    }
    if (Category) {
        query.Category = { $regex: new RegExp(Category, 'i') };
    }
    if (HukamNo) {
        query.HukamNo = { $regex: new RegExp(HukamNo, 'i') };
    }
     if (HukamDate) {
        query.HukamDate = { $regex: new RegExp(HukamDate, 'i') };
    }
      if (Taluka) {
        query.Taluka = { $regex: new RegExp(Taluka, 'i') };
    }
     if (Village) {
        query.Village = { $regex: new RegExp(Village, 'i') };
    }
    if (SurveyNo) {
        query.SurveyNo = { $regex: new RegExp(SurveyNo, 'i') };
    }
    if (Name) {
        query.Name = { $regex: new RegExp(Name, 'i') };
    }
   if (Subject) {
        query.Subject = { $regex: new RegExp(Subject, 'i') };
    }
    if (PotlaNo) {
        query.PotlaNo = { $regex: new RegExp(PotlaNo, 'i') };
    }
    if (FeristNo) {
        query.FeristNo = { $regex: new RegExp(FeristNo, 'i') };
    }

      console.log(query.Year,"query_Year");
      console.log(query.Category,"query_Cat");
      const records = await DataEntry.find(query);
      console.log(records);
      res.json(records);
    } catch (error) {
      console.error('Error Occurred:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



  router.get("/generatepdf",async (req, res) => {

         // Construct the query parameters from the request
         const queryParams = req.query; // Directly get the query parameters
         console.log("Search  queryParams", queryParams);
         // Call the searchRecordList API to fetch records
         const searchResponse = await axios.get(`http://10.154.2.172:3000/api/searchRecordList`, { params: queryParams });
         const records = searchResponse.data;
         
        console.log("Search Data",searchResponse.data);

 
    const doc = new PDFDocument();
    let filename = 'my-document.pdf';
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Load the Gujarati font (replace with the path to your font file)
 //   const gujaratiFontPath = path.join(__dirname, 'fonts', 'Shruti.ttf');
 const gujaratiFontPath = path.join(__dirname, '..', 'Font', 'Shruti.ttf');
console.log(gujaratiFontPath);
    doc.registerFont('GujaratiFont', gujaratiFontPath);

    // Add content to the PDF using the Gujarati font
    doc.font('GujaratiFont').fontSize(20).text('રેકોર્ડ લિસ્ટ', { align: 'center' });
    doc.moveDown();
    // doc.fontSize(16).text('Heading 1');
    // doc.moveDown();
   
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

// Table properties
const tableWidth =700; 
const headerHeight = 70; // Height of the header row
const rowHeight = 50; // Height of each regular row
const columnWidths = [50, 50, 40, 50, 70, 50, 50, 40, 60, 50, 50, 40]; 
const xOffset = 10; 

// Draw header row
let y = doc.y; 
doc.fontSize(12).fillColor('black');

// Draw header background and text
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
    doc.fontSize(10);
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

    y += rowHeight; // Move down for the next row
});
    // Finalize the PDF and end the stream
    doc.end();
});
module.exports = router;

