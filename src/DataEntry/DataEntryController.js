const { Router } = require('express')
const DataEntry = require('../DataEntry/DataEntryModel')
const router = Router()
const BranchMaster =require('../BranchMaster/BranchMasterModel')

//Data Enter
router.post('/InsertRecord', async (req, res) => {
    //  let Id			     = req.body.Id			             
    let Year = req.body.Year
    let Branch = req.body.Branch
    let Category = req.body.Category
    let Types = req.body.Types
    let Subject = req.body.Subject
    let Name = req.body.Name
    let Address = req.body.Address
    let Village = req.body.Village
    let Taluka = req.body.Taluka
    let OrderName = req.body.OrderName
    let CupBoardNo = req.body.CupBoardNo
    let PartitionNo = req.body.PartitionNo
    let FileNo = req.body.FileNo
    let NotePage = req.body.NotePage
    let PostPage = req.body.PostPage
    let TotalPage = req.body.TotalPage
    let DocumentName = req.body.DocumentName
    let documentId = req.body.documentId



    const dataentry = new DataEntry({

        // Id			    : Id		,	
        Year: Year,
        Branch: Branch,
        Category: Category,
        Types: Types,
        Subject: Subject,
        Name: Name,
        Address: Address,
        Village: Village,
        Taluka: Taluka,
        OrderName: OrderName,
        CupBoardNo: CupBoardNo,
        PartitionNo: PartitionNo,
        FileNo: FileNo,
        NotePage: NotePage,
        PostPage: PostPage,
        TotalPage: TotalPage,
        DocumentName: DocumentName,
        documentId: documentId


    })
    const result = await dataentry.save()
    console.log(result);
    console.log(dataentry.documentId)

    res.json({
        message: "success",
        dataentry: result
    });
});

//Data Update
router.put('/UpdateRecord', async (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }
    const id = req.body._id;

    await DataEntry.findByIdAndUpdate(id, req.body).then(data => {

        if (!data) {
            res.status(404).send({
                message: `User not found.`
            });
        } else {
            res.send({ message: "User updated successfully." })
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
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
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


router.get('/FindRecordbyID/:_id', async (req, res) => {
    // var _id = req.params._id
    console.log(req.params._id)
    let user = ''
    try {
        const user = await DataEntry.findById(req.params._id);
        if (user == null) { // checking for null values
            return res.status(404).json({ message: 'Cannot find Record' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.send(user) //sending the response

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

// Retrieve all users from the database.
// router.get('/BranchList', async (req, res) => {

//     try {
//         // Query BranchMaster collection using Mongoose model
//         const branches = await BranchMaster.find({}).limit(10); // Fetch top 50 records
//         console.log(branches);
//         res.status(200).json(branches);
//     } catch (error) {
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/college";

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   db.collection("BranchMaster").find({}).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });


module.exports = router;