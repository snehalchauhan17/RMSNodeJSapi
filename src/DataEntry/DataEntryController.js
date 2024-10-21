const { Router } = require('express')
const DataEntry = require('../DataEntry/DataEntryModel')
const router = Router()
const BranchMaster = require('../BranchMaster/BranchMasterModel')

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
module.exports = router;

