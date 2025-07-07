const { Router } = require('express')
const createDataEntryModel  = require('../DataEntry/DataEntryModel')
const DataEntry_H = require('../DataEntry/DataEntryModel_H')
const router = Router()
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Import axios for making API calls
const { connectToMongoClient,getMongooseConnection } = require('../../dbconfig');
const authenticateToken = require("../authMiddleware");
const { Console } = require('console');
router.get("/TalukaListFromDist", authenticateToken, async (req, res) => {
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

router.get("/VillageListbyID/:dcode/:TCode", authenticateToken, async (req, res) => {
  try {
    // Convert req.params.did to a number if dcode is a number in MongoDB
    const tcode = parseInt(req.params.TCode);
    const dcode = parseInt(req.params.dcode);

    const db = await connectToMongoClient();
    const collection = db.collection("VillageMaster"); // Get the collection
    const user = await collection.find({ dcode: dcode, tcode: tcode }).toArray(); // Query the collection
    if (user.length === 0) { // checking for null values
      return res.status(404).json({ message: 'Cannot find Village' })
    }
    res.status(200).send(user); // Send the results as the response

  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});
function getISTDate() {
  const now = new Date();
  now.setHours(now.getHours() + 5, now.getMinutes() + 30);
  return now;
}

//Data Enter
router.post('/InsertRecord', authenticateToken, async (req, res) => {
  // const { userId, createdBy } = req.body;  // Get createdBy from request



let officeId = req.body.officeId
  let Year = req.body.Year
  let IssueDate = req.body.IssueDate
  let Branch = req.body.Branch
  let Category = req.body.Category
  let Name = req.body.Name
  let Address = req.body.Address
  let Subject = req.body.Subject
  let HukamNo = req.body.HukamNo
  let HukamDate = req.body.HukamDate
  let DCode = req.body.dcode
  let Taluka = req.body.Taluka
  let Village = req.body.Village
  let SurveyNo = req.body.SurveyNo
  let CompactorNo = req.body.CompactorNo
  let PotlaNo = req.body.PotlaNo
  let FeristNo = req.body.FeristNo
  let NotePage = req.body.NotePage
  let PostPage = req.body.PostPage
  let TotalPage = req.body.TotalPage
  let anyDetail = req.body.anyDetail
  let documentId = req.body.documentId
  let createdBy = req.body.createdBy

    const conn = await getMongooseConnection(DCode);
console.log("conn", conn);
    // 2. Get DataEntry model from that connection
    const DataEntry = createDataEntryModel(conn);
    console.log("DataEntry", DataEntry);
  // let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  // Extract the IP address
  // Extract the correct IP address
  let ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.socket.remoteAddress;

  // Remove IPv6 prefix if needed (::ffff:)
  if (ipAddress.includes('::ffff:')) {
    ipAddress = ipAddress.split('::ffff:')[1];
  }

  const dataentry = new DataEntry({
officeId: officeId,
    Year: Year,
    IssueDate: IssueDate,
    Branch: Branch,
    Category: Category,
    Name: Name,
    Address: Address,
    Subject: Subject,
    HukamNo: HukamNo,
    HukamDate: HukamDate,
    DCode: DCode,
    Taluka: Taluka,
    Village: Village,
    SurveyNo: SurveyNo,
    CompactorNo: CompactorNo,
    PotlaNo: PotlaNo,
    FeristNo: FeristNo,
    NotePage: NotePage,
    PostPage: PostPage,
    TotalPage: TotalPage,
    anyDetail: anyDetail,
    documentId: documentId,
    createdBy: createdBy,
    createdOn: getISTDate(),
    ipAddress: ipAddress
  })
  const result = await dataentry.save()

  res.json({
    message: "success",
    dataentry: result
  });
});

router.put('/UpdateRecord/:_id', authenticateToken, async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Data to update cannot be empty!" });
    }

    const _id = req.params._id;
    const { updatedBy } = req.body;
    const updatedOn = getISTDate();

    let ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.socket.remoteAddress;
    if (ipAddress.includes('::ffff:')) {
      ipAddress = ipAddress.split('::ffff:')[1];
    }

    // Find the existing record
    const existingRecord = await DataEntry.findById(_id);
    if (!existingRecord) {
      return res.status(404).json({ message: "Record not found." });
    }

    // Save history without changing `_id`
    const recordInsertHistory = new DataEntry_H({
      originalId: existingRecord._id,  // ✅ Reference to the original record
      recordData: existingRecord.toObject(), // ✅ Save entire record as an object
      action: "UPDATED",
      updatedBy,
      ipAddress,
      updatedOn,
      historyDate: getISTDate() // ✅ Add current timestamp for history record
    });

    await recordInsertHistory.save();


    // Update the record
    const updatedData = {
      ...req.body,
      updatedBy,
      updatedOn,
      ipAddress
    };
    if (typeof req.body.documentId === "undefined") {
      updatedData.documentId = existingRecord.documentId;
    }
    const updatedRecord = await DataEntry.findByIdAndUpdate(_id, updatedData, { new: true });
    res.json({ message: "Record updated successfully.", data: updatedRecord });

  } catch (err) {
    res.status(500).json({ message: err.message || "An error occurred while updating the record." });
  }
});

//Data Delete
router.delete('/DeleteRecord/:_id', authenticateToken, async (req, res) => {
  try {
    var _id = req.params._id

    if (!_id) {
      return res.status(400).json({ message: 'Missing _id field in request body' });
    }
    const { updatedBy } = req.body;
    const updatedOn = new Date();
    // Extract the correct IP address
    let ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.socket.remoteAddress;
    if (ipAddress.includes('::ffff:')) {
      ipAddress = ipAddress.split('::ffff:')[1];
    }

    // Find the existing record
    const existingRecord = await DataEntry.findById(_id);
    if (!existingRecord) {
      return res.status(404).json({ message: "Record not found." });
    }

    // Save history without changing `_id`
    const recordInsertHistory = new DataEntry_H({
      originalId: existingRecord._id,  // ✅ Reference to the original record
      recordData: existingRecord.toObject(), // ✅ Save entire record as an object
      action: "Deleted",
      updatedBy,
      ipAddress,
      updatedOn,
      historyDate: new Date() // ✅ Add current timestamp for history record
    });

    await recordInsertHistory.save();  // ✅ Save history record

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

router.get('/FindRecordbyID/:_id', authenticateToken, async (req, res) => {

  let user = ''
  try {
    const user = await DataEntry.findById(req.params._id);
    if (user == null) { // checking for null values
      return res.status(404).json({ message: 'Cannot find Record' })
    }
    res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  // res.send(user) //sending the response

})

// Retrieve all users from the database.
router.get('/RecordList', authenticateToken, async (req, res) => {

  try {
    const db = await connectToMongoClient();
    const collection = db.collection("dataentries");

    const results = await collection.aggregate([
      {
        $lookup: {
          from: 'TalukaMaster',
          let: { dCode: { $toString: '$DCode' }, taluka: { $toString: '$Taluka' } },
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
          let: { dCode: { $toString: '$DCode' }, taluka: { $toString: '$Taluka' }, village: { $toString: '$Village' } },
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
function formatDateDDMMYYYY(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

async function getSearchRecords(queryParams, db) {

  
  const {
    Year, Branch, Category, HukamNo, HukamDate,
    DCode, Taluka, Village, SurveyNo, Name,
    Subject, PotlaNo, FeristNo
  } = queryParams;

  const query = {};
  const collection = db.collection("dataentries");


    if (Year) query.Year = { $regex: new RegExp(Year, "i") };
    if (Category) query.Category = { $regex: new RegExp(Category, "i") };
    if (HukamNo) query.HukamNo = { $regex: new RegExp(HukamNo, "i") };
    if (HukamDate) query.HukamDate = { $regex: new RegExp(HukamDate, "i") };
    if (SurveyNo) query.SurveyNo = { $regex: new RegExp(`^${SurveyNo}$`, "i") };
    if (Name) query.Name = { $regex: new RegExp(Name, "i") };
    if (Subject) query.Subject = { $regex: new RegExp(Subject, "i") };
    if (PotlaNo) query.PotlaNo = { $regex: new RegExp(`^${PotlaNo}$`, "i") };
    if (FeristNo) query.FeristNo = { $regex: new RegExp(FeristNo, "i") };


  if (Taluka) {
    const talukaRecord = await db.collection("TalukaMaster").find({
      TalName_G: { $regex: new RegExp(Taluka, "i") },
    }).toArray();

    if (talukaRecord.length > 0) {
      query.Taluka = { $in: talukaRecord.map(v => v.TCode) };
      query.DCode = { $in: talukaRecord.map(v => v.DCode) };
    } else {
      return [];
    }
  }

  if (Village) {
    const villageRecord = await db.collection("VillageMaster").find({
      vname_g: { $regex: new RegExp(Village, "i") },
    }).toArray();

    if (villageRecord.length > 0) {
      query.Village = { $in: villageRecord.map(v => v.dtv) };
      query.Taluka = { $in: villageRecord.map(v => v.tcode) };
      query.DCode = { $in: villageRecord.map(v => v.dcode) };
    } else {
      return [];
    }
  }

  if (Branch) {
    const branchRecord = await db.collection("BranchMaster").find({
      BRANCH: { $regex: new RegExp(Branch, "i") },
    }).toArray();

    if (branchRecord.length > 0) {
      query.Branch = { $in: branchRecord.map(v => v._id.toString()) };
    } else {
      return [];
    }
  }

  const results = await collection.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "TalukaMaster",
        let: { dCode: "$DCode", tCode: "$Taluka" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$DCode", "$$dCode"] },
                  { $eq: ["$TCode", "$$tCode"] },
                ],
              },
            },
          },
        ],
        as: "talukaDetails",
      },
    },
    { $unwind: { path: "$talukaDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "VillageMaster",
        let: { dCode: "$DCode", tCode: "$Taluka", vCode: "$Village" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$dcode", "$$dCode"] },
                  { $eq: ["$tcode", "$$tCode"] },
                  { $eq: ["$dtv", "$$vCode"] },
                ],
              },
            },
          },
        ],
        as: "villageDetails",
      },
    },
    { $unwind: { path: "$villageDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "BranchMaster",
        let: { branchId: { $toString: "$Branch" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: "$_id" }, "$$branchId"],
              },
            },
          },
        ],
        as: "branchDetails",
      },
    },
    { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        Year: 1,
        DCode: 1,
        Taluka: 1,
        Village: 1,
        Branch: 1,
        Name: 1,
        Address: 1,
        Category: 1,
        Subject: 1,
        HukamNo: 1,
        HukamDate: 1,
        SurveyNo: 1,
        PotlaNo: 1,
        FeristNo: 1,
        IssueDate: 1,
        NotePage: 1,
        PostPage: 1,
        TotalPage: 1,
        anyDetail: 1,
        documentId: 1,
        TalukaName: "$talukaDetails.TalName_G",
        DistrictName: "$talukaDetails.DistName_G",
        VillageName: "$villageDetails.vname_g",
        BranchName: "$branchDetails.BRANCH",
      },
    },
  ]).toArray();

  return results;
}

router.get("/searchRecordList", authenticateToken, async (req, res) => {
  try {
    const db = await connectToMongoClient();
    const results = await getSearchRecords(req.query, db);
    res.json(results);
  } catch (error) {
    console.error("Error fetching search records:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
function drawTableHeader(doc, headers, columnWidths, xOffset, y) {
  const headerHeight = 70;

  headers.forEach((item, i) => {
    const cellWidth = columnWidths[i];
    const cellX = xOffset + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);

    doc.rect(cellX, y, cellWidth, headerHeight).fillAndStroke('lightgray', 'black');
    doc.fillColor('black').font('GujaratiFont').fontSize(10).text(item.header, cellX + 5, y + 10, {
      width: cellWidth - 10,
      align: 'center',
    });
  });

  return y + headerHeight + 5;
}

router.get("/generatepdf", authenticateToken, async (req, res) => {
  const db = await connectToMongoClient();
  const records = await getSearchRecords(req.query, db);
  console.log(records);
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
  let filename = 'RecordList.pdf';
  res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-type', 'application/pdf');
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
    { header: 'શાખા', field: 'BranchName' },
    { header: 'વર્ગ', field: 'Category' },
    { header: 'આખરી હુકમ નંબર', field: 'HukamNo' },
    { header: 'હુકમ ની તારીખ', field: 'HukamDate' },
    { header: 'જિલ્લો', field: 'DistrictName' },
    { header: 'તાલુકો', field: 'TalukaName' },
    { header: 'ગામ', field: 'VillageName' },
    { header: 'સર્વે નંબર', field: 'SurveyNo' },
    { header: 'અરજદાર નુ નામ', field: 'Name' },
    { header: 'વિષય', field: 'Subject' },
    { header: 'પોટલા નંબર', field: 'PotlaNo' },
    { header: 'ફેરીસ્ટ નંબર', field: 'FeristNo' }
  ];


  const columnWidths = headers.map(header => Math.max(header.header.length * 6, 50));
  const rowHeight = 50;
  const xOffset = 20;
  const maxY = doc.page.height - 50;
 let y = doc.y;
  y = drawTableHeader(doc, headers, columnWidths, xOffset, y);


  records.forEach((item, index) => {
    if (item.HukamDate) item.HukamDate = formatDateDDMMYYYY(item.HukamDate);

    if (y + rowHeight > maxY) {
      doc.addPage();
      y = 50;
      y = drawTableHeader(doc, headers, columnWidths, xOffset, y);
    }

    doc.fontSize(7).fillColor('black').font('GujaratiFont');

  headers.forEach((header, i) => {
      const cellWidth = columnWidths[i];
      const cellX = xOffset + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
      const cellValue = item[header.field] || '';

      doc.rect(cellX, y, cellWidth, rowHeight).stroke();
      doc.text(cellValue.toString(), cellX + 5, y + 5, {
        width: cellWidth - 10,
        align: 'center',
      });
    });
    y += rowHeight;

  });

  // Finalize the PDF and end the stream
  doc.end();
});
// router.get("/generatepdf", authenticateToken, async (req, res) => {
//   try {
//     const db = await connectToMongoClient();
//     const records = await getSearchRecords(req.query, db);
// console.log(records);
// const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
//   let filename = 'RecordList.pdf';
//   res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
//   res.setHeader('Content-type', 'application/pdf');

//   // Pipe the PDF into the response
//   doc.pipe(res);

//   // Load the Gujarati font (replace with the path to your font file)
//   const gujaratiFontPath = path.join(__dirname, '..', 'Font', 'Shruti.ttf');

//   doc.registerFont('GujaratiFont', gujaratiFontPath);

//   // Add content to the PDF using the Gujarati font
//   doc.font('GujaratiFont').fontSize(20).text('રેકોર્ડ લિસ્ટ', { align: 'center' });
//   doc.moveDown();

//   // Define headers and corresponding fields
//   const headers = [
//     { header: 'ફાઇલનુ વર્ષ', field: 'Year' },
//     { header: 'શાખા', field: 'BranchName' },
//     { header: 'વર્ગ', field: 'Category' },
//     { header: 'આખરી હુકમ નંબર', field: 'HukamNo' },
//     { header: 'હુકમ ની તારીખ', field: 'HukamDate' },
//     { header: 'જિલ્લો', field: 'DistrictName' },
//     { header: 'તાલુકો', field: 'TalukaName' },
//     { header: 'ગામ', field: 'VillageName' },
//     { header: 'સર્વે નંબર', field: 'SurveyNo' },
//     { header: 'અરજદાર નુ નામ', field: 'Name' },
//     { header: 'વિષય', field: 'Subject' },
//     { header: 'પોટલા નંબર', field: 'PotlaNo' },
//     { header: 'ફેરીસ્ટ નંબર', field: 'FeristNo' }
//   ];
     


//  const columnWidths = headers.map(header => Math.max(header.header.length * 6, 50));
//     const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
//     const headerHeight = 70;
//     const xOffset = 10;
//     const pageHeight = 750; // Adjust for landscape A4
//     let y = doc.y;

//  // Draw header row function (for reuse)
//     function drawHeaderRow() {
//       doc.font('GujaratiFont').fontSize(10).fillColor('black');
//       headers.forEach((item, i) => {
//         const cellWidth = columnWidths[i];
//         const cellX = xOffset + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//         doc.rect(cellX, y, cellWidth, headerHeight).fillAndStroke('lightgray', 'black');
//         doc.fillColor('black').text(item.header, cellX + 5, y + 15, { width: cellWidth - 10, align: 'center' });
//       });
//       y += headerHeight;
//       doc.moveTo(xOffset, y).lineTo(xOffset + tableWidth, y).stroke();
//       y += 5;
//     }

//         // Draw first header
//     drawHeaderRow();

//   // Loop through each record and create table rows
//   records.forEach(item => {
//       // Format HukamDate (and any other date fields you want)
//   if (item.HukamDate) {
//     item.HukamDate = formatDateDDMMYYYY(item.HukamDate);
//   }
//      // 1. Calculate the height needed for each cell in this row
//       const cellHeights = headers.map((header, i) => {
//         const cellWidth = columnWidths[i] - 10; // padding
//     const cellValue = item[header.field] ? String(item[header.field]) : '';

//         return doc.heightOfString(cellValue, {
//           width: cellWidth,
//           align: 'center',
//           font: 'GujaratiFont',
//           size: 8
//         }) + 10; // vertical padding
//       });

//  // 2. Set rowHeight to the max cell height for this row
//       const dynamicRowHeight = Math.max(...cellHeights, 30);
//     // 3. Page break if needed
//       if (y + dynamicRowHeight > pageHeight) {
//         doc.addPage();
// y = 40; // <<-- Set this to a value like 40 (top margin for new page)
//             drawHeaderRow();
//         // Redraw header on new page
//           doc.font('GujaratiFont').fontSize(10).fillColor('black');
//     headers.forEach((item, i) => {
//     const cellWidth = columnWidths[i];
//     const cellX = xOffset + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//     doc.rect(cellX, y, cellWidth, headerHeight).fillAndStroke('lightgray', 'black');
//     doc.fillColor('black').text(item.header, cellX + 5, y + 15, { width: cellWidth - 10, align: 'center' });
//   });
//     y += headerHeight;
//     doc.moveTo(xOffset, y).lineTo(xOffset + tableWidth, y).stroke();
//     y += 5;
//   }

//   // Draw the row
//   doc.font('GujaratiFont').fontSize(8).fillColor('black');
//   headers.forEach((header, i) => {
//     const cellWidth = columnWidths[i];
//     const cellX = xOffset + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//     const cellValue = item[header.field] ? String(item[header.field]) : '';
//     doc.rect(cellX, y, cellWidth, dynamicRowHeight).stroke();
//     doc.text(cellValue, cellX + 5, y + 5, { width: cellWidth - 10, align: 'center' });
//   });


//       // Move to the next row
//       y += dynamicRowHeight;

//     });

//     // Finalize the PDF and end the stream
//     doc.end();
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     res.status(500).json({ message: "Failed to generate PDF" });
//   }
// });
// router.get("/searchRecordList", authenticateToken, async (req, res) => {
//   try {
//     const db = await connectToMongoClient();
//     const collection = db.collection("dataentries");

//     const {
//       Year,
//       Branch,
//       Category,
//       HukamNo,
//       HukamDate,
//       DCode,
//       Taluka,
//       Village,
//       SurveyNo,
//       Name,
//       Subject,
//       PotlaNo,
//       FeristNo,
//     } = req.query;

//     const query = {};

//     if (Year) query.Year = { $regex: new RegExp(Year, "i") };
//     if (Category) query.Category = { $regex: new RegExp(Category, "i") };
//     if (HukamNo) query.HukamNo = { $regex: new RegExp(HukamNo, "i") };
//     if (HukamDate) query.HukamDate = { $regex: new RegExp(HukamDate, "i") };
//     if (SurveyNo) query.SurveyNo = { $regex: new RegExp(`^${SurveyNo}$`, "i") };
//     if (Name) query.Name = { $regex: new RegExp(Name, "i") };
//     if (Subject) query.Subject = { $regex: new RegExp(Subject, "i") };
//     if (PotlaNo) query.PotlaNo = { $regex: new RegExp(`^${PotlaNo}$`, "i") };
//     if (FeristNo) query.FeristNo = { $regex: new RegExp(FeristNo, "i") };

//     if (Taluka) {
//       const talukaRecord = await db.collection("TalukaMaster").find({
//         TalName_G: { $regex: new RegExp(Taluka, "i") }, // partial match
//       }).toArray();

//       if (talukaRecord.length > 0) {
//         const tcodeList = talukaRecord.map(v => v.TCode);
//         const dcodeList = talukaRecord.map(v => v.DCode);

        
//         query.Taluka = { $in: tcodeList };
//         query.DCode =  { $in: dcodeList };
//       } else {
//         return res.status(404).json({ message: "Taluka not found" });
//       }
//     }

//     if (Village) {
//       const villageRecords = await db.collection("VillageMaster").find({
//         vname_g: { $regex: new RegExp(Village, "i") }, // partial match
//       }).toArray();
    
//       if (villageRecords.length > 0) {
//         const dtvList = villageRecords.map(v => v.dtv);
//         const tcodeList = villageRecords.map(v => v.tcode);
//         const dcodeList = villageRecords.map(v => v.dcode);
    
//         query.Village = { $in: dtvList };
//         query.Taluka =  { $in: tcodeList };
//         query.DCode = { $in: dcodeList };
//       } else {
//         return res.status(404).json({ message: "No matching villages found" });
//       }
//     }

//     if (Branch) {

//       const branchRecord = await db.collection("BranchMaster").find({
//   BRANCH: { $regex: new RegExp(Branch, "i") },
// }).toArray(); // <-- Add this


//       if (branchRecord.length > 0) {
//         const branchlist = branchRecord.map(v => v._id.toString());

//         query.Branch = { $in: branchlist };

//       } else {
//         return res.status(404).json({ message: "No matching villages found" });
//       }
//       // if (branchRecord) {
//       //   query.Branch = branchRecord._id.toString();
//       // } else {
//       //   return res.status(404).json({ message: "Branch not found" });
//       // }
//     }

//     const results = await collection.aggregate([
//       { $match: query },

//       // Taluka lookup
//       {
//         $lookup: {
//           from: "TalukaMaster",
//           let: { dCode: "$DCode", tCode: "$Taluka" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$DCode", "$$dCode"] },
//                     { $eq: ["$TCode", "$$tCode"] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "talukaDetails",
//         },
//       },
//       { $unwind: { path: "$talukaDetails", preserveNullAndEmptyArrays: true } },

//       // Village lookup
//       {
//         $lookup: {
//           from: "VillageMaster",
//           let: { dCode: "$DCode", tCode: "$Taluka", vCode: "$Village" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$dcode", "$$dCode"] },
//                     { $eq: ["$tcode", "$$tCode"] },
//                     { $eq: ["$dtv", "$$vCode"] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "villageDetails",
//         },
//       },
//       { $unwind: { path: "$villageDetails", preserveNullAndEmptyArrays: true } },

//       // Branch lookup
//       {
//         $lookup: {
//           from: "BranchMaster",
//           let: { branchId: { $toString: "$Branch" } },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: [{ $toString: "$_id" }, "$$branchId"],
//                 },
//               },
//             },
//           ],
//           as: "branchDetails",
//         },
//       },
//       { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

//       // Final shape of document
//       {
//         $project: {
//           _id: 1,
//           Year: 1,
//           DCode: 1,
//           Taluka: 1,
//           Village: 1,
//           Branch: 1,
//           Name: 1,
//           Address: 1,
//           Category: 1,
//           Subject: 1,
//           HukamNo: 1,
//           HukamDate: 1,
//           SurveyNo: 1,
//           PotlaNo: 1,
//           FeristNo: 1,
//           IssueDate: 1,
//           NotePage: 1,
//           PostPage: 1,
//           TotalPage: 1,
//           anyDetail: 1,
//           documentId: 1,
//           TalukaName: "$talukaDetails.TalName_G",
//           DistrictName: "$talukaDetails.DistName_G",
//           VillageName: "$villageDetails.vname_g",
//           BranchName: "$branchDetails.BRANCH",
//         },
//       },
//     ]).toArray();

//     res.json(results);
//   } catch (error) {
//     console.error("Error fetching search records:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// router.get("/generatepdf", authenticateToken, async (req, res) => {

//   // Construct the query parameters from the request
//   const queryParams = req.query; // Directly get the query parameters


//   // Call the searchRecordList API to fetch records
//   //const searchResponse = await axios.get(`http://localhost:3000/api/searchRecordList`, { params: queryParams });
//   //  const searchResponse = await axios.get(`http://stagingrmsapp.gujarat.gov.in/rms/api/searchRecordList`, { params: queryParams });

//   const token = req.headers.authorization; // Extract token from request
//   const searchResponse = await axios.get(`http://localhost:3000/api/searchRecordList`, {
//     params: queryParams,
//     headers: { Authorization: token }
//   });

//   const records = searchResponse.data;

//   const doc = new PDFDocument();
//   let filename = 'my-document.pdf';
//   res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
//   res.setHeader('Content-type', 'application/pdf');

//   // Pipe the PDF into the response
//   doc.pipe(res);

//   // Load the Gujarati font (replace with the path to your font file)
//   const gujaratiFontPath = path.join(__dirname, '..', 'Font', 'Shruti.ttf');

//   doc.registerFont('GujaratiFont', gujaratiFontPath);

//   // Add content to the PDF using the Gujarati font
//   doc.font('GujaratiFont').fontSize(20).text('રેકોર્ડ લિસ્ટ', { align: 'center' });
//   doc.moveDown();

//   // Define headers and corresponding fields
//   const headers = [
//     { header: 'ફાઇલનુ વર્ષ', field: 'Year' },
//     { header: 'શાખા', field: 'BranchName' },
//     { header: 'વર્ગ', field: 'Category' },
//     { header: 'આખરી હુકમ નંબર', field: 'HukamNo' },
//     { header: 'હુકમ ની તારીખ', field: 'HukamDate' },
//     { header: 'તાલુકો', field: 'TalukaName' },
//     { header: 'ગામ', field: 'VillageName' },
//     { header: 'સર્વે નંબર', field: 'SurveyNo' },
//     { header: 'અરજદાર નુ નામ', field: 'Name' },
//     { header: 'વિષય', field: 'Subject' },
//     { header: 'પોટલા નંબર', field: 'PotlaNo' },
//     { header: 'ફેરીસ્ટ નંબર', field: 'FeristNo' }
//   ];

//   // Dynamically calculate column widths with increased space
//   const columnWidths = headers.map(header => {
//     return Math.max(header.header.length * 3, 50); // Increase width to handle long texts like 'Subject', 'PotlaNo', 'FeristNo'
//   });

//   const tableWidth = 700;
//   const headerHeight = 70; // Height of the header row
//   //const rowHeight = 80; // Height of each regular row

//   //const xOffset = 10;  //this code dynamic  without modify other code 
//   // // Calculate the total table width
//   // const tableWidth = columnWidths.reduce((total, width) => total + width, 0);

//   // const headerHeight = 80; // Fixed header height
//   // const rowHeight = 90; // Increased row height to fit longer text
//   // const xOffset = 5;

//   const rowHeight = 70; // Decreased row height to fit better (adjust as needed)
//   const xOffset = 10;
//   const pageHeight = 750; // Define a maximum page height (adjust based on your needs)

//   let y = doc.y;
//   let rowCount = 0; // Track rows to manage page breaks

//   // Draw header row
//   doc.fontSize(10).fillColor('black');
//   headers.forEach((item, i) => {
//     const cellWidth = columnWidths[i];
//     const cellX = xOffset + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);

//     // Draw header cell with headerHeight
//     doc.rect(cellX, y, cellWidth, headerHeight).fillAndStroke('lightgray', 'black');

//     // Draw header text
//     doc.fillColor('black').text(item.header, cellX + 5, y + 10, { width: cellWidth - 10, align: 'center' });
//   });

//   // Draw a line under the header
//   y += headerHeight; // Move down to the next row position
//   doc.moveTo(xOffset, y).lineTo(xOffset + tableWidth, y).stroke();
//   y += 5; // Add some space before the first data row

//   // Loop through each record and create table rows
//   records.forEach(item => {
//     if (y + rowHeight > pageHeight) {
//       // Check if there is enough space on the current page
//       doc.addPage(); // Add a new page if needed
//       y = 0; // Reset Y position for the new page
//       rowCount = 0; // Reset row count on a new page
//     }

//     // Draw table rows
//     doc.fontSize(7);
//     doc.fillColor('black');
//     headers.forEach((header, i) => {
//       const cellWidth = columnWidths[i];
//       const cellX = xOffset + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
//       const cellValue = item[header.field] || '';

//       // Draw cell border for regular rows
//       doc.rect(cellX, y, cellWidth, rowHeight).stroke();

//       // Draw cell value
//       doc.text(cellValue, cellX + 5, y + 5, { width: cellWidth - 10, align: 'center' });
//     });

//     // Move to the next row
//     y += rowHeight;
//     rowCount++;

//     // If the row count exceeds a certain threshold (e.g., 10 rows), consider adding a new page
//     if (rowCount > 10) {
//       doc.addPage();
//       y = 0; // Reset y position
//       rowCount = 0; // Reset row count
//     }
//   });

//   // Finalize the PDF and end the stream
//   doc.end();
// });
module.exports = router;
