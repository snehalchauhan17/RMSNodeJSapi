const { Router } = require('express')
const DataEntry = require('../DataEntry/DataEntryModel')
const router = Router()
const BranchMaster = require('../BranchMaster/BranchMasterModel')

//Data Enter
router.post('/InsertRecord', async (req, res) => {

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
router.get('/RecordList', async (req, res) => {

    try {
        const user = await DataEntry.find();
        -
            res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


module.exports = router;

 //         const id = req.body._id; // Assuming _id is provided in the request body
        //         console.log(id)
        //         // Find and update the record by its ID
        //         const updatedRecord = await DataEntry.findByIdAndUpdate(id, req.body);
        // console.log(updatedRecord)
        //         // If no record found, return a 404 status
        //         if (!updatedRecord) {
        //             return res.status(404).json({
        //                 message: `Record not found.`
        //             });
        //         }

        //         // Send a success message if the record was updated successfully
        //         res.status(200).json({ message: "Record updated successfully." });
        