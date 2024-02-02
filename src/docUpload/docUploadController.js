
const { Router } = require('express')
const { ObjectId } = require('mongodb');

const docUpload = require('../docUpload/docUploadModel')
const router = Router()
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Assuming docUpload is your Mongoose model for storing documents
    const newDoc = new docUpload({
        name: req.file.originalname,
        doc: {
            data: req.file.buffer,
            contentType: req.file.mimetype
        },
        stream: req.file.stream,
        size: req.file.size,
        path: req.file.path
    });

    try {
        // Save the document
        const savedDoc = await newDoc.save();
        res.status(201).json({
            message: 'File uploaded successfully!',
            document: savedDoc
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});



// router.get('/ViewDoc', async (req, res) => {
//     const recordId = req.query._id; // Assuming the recordId is passed as a query parameter

//     try {
//         const db = await connectToDatabase();

//         const result = await db.collection('DataEntry').aggregate([
//             {
//                 $match: {
//                     recordId: ObjectId(recordId) // Assuming recordId is stored as ObjectId in MongoDB
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'docupload',
//                     localField: 'documentId',
//                     foreignField: '_id',
//                     as: 'documents'
//                 }
//             }
//         ]).toArray();

//         res.json(result);
//     } catch (error) {
//         console.error('Error executing aggregation:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// router.get('/DocList', async (req, res) => {
//     const recordId = req.query._id; // Assuming the recordId is passed as a query parameter

//     try {
//         const db = await connectToDatabase();

//         const result = await db.collection('DataEntry').aggregate([
//             {
//                 $match: {
//                     recordId: ObjectId(recordId) // Assuming recordId is stored as ObjectId in MongoDB
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'docupload',
//                     localField: 'documentId',
//                     foreignField: 'documentId',
//                     as: 'documents'
//                 }
//             }
//         ]).toArray();

//         res.json(result);
//     } catch (error) {
//         console.error('Error executing aggregation:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// Define another API endpoint to fetch and view documents
router.get('/ViewDocument/:_id', async (req, res) => {
    const documentId = req.params._id; // Use params to get the documentId from URL parameters

    try {
        // Fetch the document from the database by documentId
        const document = await docUpload.findOne({ _id: new ObjectId(documentId) });
console.log(document);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Send the binary data of the document
        res.contentType('application/pdf'); // Assuming the document is a PDF
        res.send(document.doc.data); 
        console.log(document.doc.data)// Assuming binary data is stored as 'binaryData' in the document schema
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;