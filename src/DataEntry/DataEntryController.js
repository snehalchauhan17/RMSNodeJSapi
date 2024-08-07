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
      const { Year, Branch, Category, Types, Subject, Name, Address, Village, Taluka, OrderName, CupBoardNo, PartitionNo, FileNo } = req.query;

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
      if (Types) {
          query.Types = { $regex: new RegExp(Types, 'i') };
      }
      if (Subject) {
          query.Subject = { $regex: new RegExp(Subject, 'i') };
      }
      if (Name) {
          query.Name = { $regex: new RegExp(Name, 'i') };
      }
      if (Address) {
          query.Address = { $regex: new RegExp(Address, 'i') };
      }
      if (Village) {
          query.Village = { $regex: new RegExp(Village, 'i') };
      }
      if (Taluka) {
          query.Taluka = { $regex: new RegExp(Taluka, 'i') };
      }
      if (OrderName) {
          query.OrderName = { $regex: new RegExp(OrderName, 'i') };
      }
      if (CupBoardNo) {
          query.CupBoardNo = { $regex: new RegExp(CupBoardNo, 'i') };
      }
      if (PartitionNo) {
          query.PartitionNo = { $regex: new RegExp(PartitionNo, 'i') };
      }
      if (FileNo) {
          query.FileNo = { $regex: new RegExp(FileNo, 'i') };
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
module.exports = router;

